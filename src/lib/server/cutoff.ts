/**
 * Cut-off Time Processing
 *
 * Handles daily cut-off for transactions that weren't completed.
 * Cancels draft transactions and notifies suppliers.
 */

import { db } from './db';
import { dailyTransactions, stores } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { createNotification } from './notifications';
import { logTransactionAudit } from './audit';
import { getTodayDate } from '$lib/utils';

/**
 * Process daily cut-off for a store
 * Cancels all draft transactions and notifies suppliers
 */
export async function processDailyCutoff(storeId: number): Promise<{ cancelled: number }> {
	const today = getTodayDate();

	try {
		// Get all draft transactions for today
		const draftTransactions = await db
			.select()
			.from(dailyTransactions)
			.where(
				and(
					eq(dailyTransactions.storeId, storeId),
					eq(dailyTransactions.date, today),
					eq(dailyTransactions.status, 'draft')
				)
			);

		let cancelledCount = 0;

		for (const trx of draftTransactions) {
			// Update status to cancelled
			await db
				.update(dailyTransactions)
				.set({ status: 'cancelled' })
				.where(eq(dailyTransactions.id, trx.id));

			// Log audit
			await logTransactionAudit(
				trx.id,
				'transaction_cancelled',
				0, // System actor
				{ status: 'draft' },
				{ status: 'cancelled' },
				'Cut-off time exceeded'
			);

			// Notify supplier
			await createNotification({
				userId: trx.supplierId,
				type: 'info',
				title: 'Transaksi Dibatalkan',
				message: `Transaksi Anda tanggal ${today} dibatalkan karena melewati cut-off time. Silakan setor ulang besok.`,
				relatedStoreId: storeId
			});

			cancelledCount++;
		}

		return { cancelled: cancelledCount };
	} catch (error) {
		console.error('[Cutoff] Failed to process cutoff:', error);
		throw error;
	}
}

/**
 * Get store cut-off time
 */
export async function getStoreCutoffTime(storeId: number): Promise<string | null> {
	const store = await db
		.select({ closeTime: stores.closeTime })
		.from(stores)
		.where(eq(stores.id, storeId))
		.limit(1);

	return store[0]?.closeTime || null;
}

/**
 * Check if current time is past cut-off
 */
export function isPastCutoff(cutoffTime: string): boolean {
	const now = new Date();
	const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);

	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	if (currentHour > cutoffHour) return true;
	if (currentHour === cutoffHour && currentMinute >= cutoffMinute) return true;

	return false;
}

/**
 * Get time remaining until cut-off
 */
export function getTimeUntilCutoff(cutoffTime: string): { hours: number; minutes: number } | null {
	const now = new Date();
	const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);

	const cutoffDate = new Date();
	cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);

	const diff = cutoffDate.getTime() - now.getTime();

	if (diff <= 0) return null;

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	return { hours, minutes };
}

/**
 * Process cut-off for all stores
 */
export async function processAllStoresCutoff(): Promise<{ stores: number; transactions: number }> {
	const allStores = await db.select().from(stores);

	let totalTransactions = 0;

	for (const store of allStores) {
		if (store.closeTime && isPastCutoff(store.closeTime)) {
			const result = await processDailyCutoff(store.id);
			totalTransactions += result.cancelled;
		}
	}

	return { stores: allStores.length, transactions: totalTransactions };
}
