/**
 * Scheduler Service
 *
 * Provides cut-off time enforcement and auto-cancel functionality.
 * This module handles scheduled tasks for store operations.
 */

import { db } from './db';
import {
	stores,
	dailyTransactions,
	users,
	notifications,
	type NotificationType
} from './db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { getTodayDate } from '$lib/utils';
import { logTransactionAudit } from './audit';

// ============================================
// TYPES
// ============================================

export interface CutoffStatus {
	storeId: number;
	storeName: string;
	cutoffTime: string;
	currentTime: string;
	isAfterCutoff: boolean;
	minutesUntilCutoff: number;
	pendingDrafts: number;
	autoCancelEnabled: boolean;
}

export interface AutoCancelResult {
	storeId: number;
	cancelledCount: number;
	notifiedSuppliers: number[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse time string (HH:mm) to minutes from midnight
 */
function timeToMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}

/**
 * Get current time as HH:mm string
 */
function getCurrentTime(): string {
	const now = new Date();
	return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Calculate minutes until cutoff
 */
function minutesUntil(targetTime: string): number {
	const now = timeToMinutes(getCurrentTime());
	const target = timeToMinutes(targetTime);
	return target - now;
}

// ============================================
// CUTOFF STATUS
// ============================================

/**
 * Get cutoff status for a specific store
 */
export async function getStoreCutoffStatus(storeId: number): Promise<CutoffStatus | null> {
	const store = await db.query.stores.findFirst({
		where: eq(stores.id, storeId)
	});

	if (!store) return null;

	const today = getTodayDate();
	const currentTime = getCurrentTime();
	const cutoffTime = store.cutoffTime || '11:00';
	const gracePeriod = store.cutoffGracePeriod || 30;

	// Calculate effective cutoff (cutoff + grace period)
	const cutoffMinutes = timeToMinutes(cutoffTime);
	const effectiveCutoffMinutes = cutoffMinutes + gracePeriod;
	const effectiveCutoffTime = `${Math.floor(effectiveCutoffMinutes / 60).toString().padStart(2, '0')}:${(effectiveCutoffMinutes % 60).toString().padStart(2, '0')}`;

	const currentMinutes = timeToMinutes(currentTime);
	const isAfterCutoff = currentMinutes >= effectiveCutoffMinutes;

	// Count pending drafts
	const drafts = await db
		.select()
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.date, today),
				eq(dailyTransactions.status, 'draft')
			)
		);

	return {
		storeId,
		storeName: store.name,
		cutoffTime,
		currentTime,
		isAfterCutoff,
		minutesUntilCutoff: minutesUntil(effectiveCutoffTime),
		pendingDrafts: drafts.length,
		autoCancelEnabled: store.autoCancelEnabled ?? true
	};
}

/**
 * Get all stores that have passed their cutoff time
 */
export async function getStoresPastCutoff(): Promise<CutoffStatus[]> {
	const allStores = await db.select().from(stores).where(eq(stores.isOpen, true));

	const results: CutoffStatus[] = [];

	for (const store of allStores) {
		const status = await getStoreCutoffStatus(store.id);
		if (status && status.isAfterCutoff && status.pendingDrafts > 0) {
			results.push(status);
		}
	}

	return results;
}

// ============================================
// AUTO-CANCEL FUNCTIONS
// ============================================

/**
 * Auto-cancel all draft transactions for a store that have passed cutoff
 */
export async function autoCancelDraftTransactions(storeId: number): Promise<AutoCancelResult> {
	const today = getTodayDate();
	const result: AutoCancelResult = {
		storeId,
		cancelledCount: 0,
		notifiedSuppliers: []
	};

	// Get store info
	const store = await db.query.stores.findFirst({
		where: eq(stores.id, storeId)
	});

	if (!store || !store.autoCancelEnabled) {
		return result;
	}

	// Get all draft transactions for today
	const drafts = await db
		.select()
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.date, today),
				eq(dailyTransactions.status, 'draft')
			)
		);

	for (const draft of drafts) {
		// Update transaction status to cancelled
		await db
			.update(dailyTransactions)
			.set({ status: 'cancelled' })
			.where(eq(dailyTransactions.id, draft.id));

		// Log audit
		await logTransactionAudit(
			draft.id,
			'transaction_cancelled',
			0, // System actor
			{ status: 'draft' },
			{ status: 'cancelled' },
			'Auto-cancelled: cutoff time exceeded'
		);

		// Create notification for supplier
		await db.insert(notifications).values({
			userId: draft.supplierId,
			type: 'transaction_cancelled' as NotificationType,
			title: 'Transaksi Dibatalkan',
			message: `Transaksi Anda untuk tanggal ${today} di "${store.name}" dibatalkan karena melewati batas waktu (${store.cutoffTime}).`,
			detailUrl: `/app/${storeId}/history`,
			relatedStoreId: storeId
		});

		result.cancelledCount++;
		if (!result.notifiedSuppliers.includes(draft.supplierId)) {
			result.notifiedSuppliers.push(draft.supplierId);
		}
	}

	return result;
}

/**
 * Run auto-cancel for all stores that have passed cutoff
 */
export async function runAutoCancelForAllStores(): Promise<AutoCancelResult[]> {
	const storesPastCutoff = await getStoresPastCutoff();
	const results: AutoCancelResult[] = [];

	for (const status of storesPastCutoff) {
		if (status.autoCancelEnabled) {
			const result = await autoCancelDraftTransactions(status.storeId);
			if (result.cancelledCount > 0) {
				results.push(result);
			}
		}
	}

	return results;
}

// ============================================
// WARNING NOTIFICATIONS
// ============================================

/**
 * Send cutoff warning notifications to suppliers with pending drafts
 */
export async function sendCutoffWarnings(storeId: number, minutesBefore: number = 30): Promise<number> {
	const status = await getStoreCutoffStatus(storeId);

	if (!status || status.minutesUntilCutoff > minutesBefore || status.minutesUntilCutoff <= 0) {
		return 0;
	}

	const today = getTodayDate();
	let notifiedCount = 0;

	// Get draft transactions
	const drafts = await db
		.select({
			supplierId: dailyTransactions.supplierId
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.date, today),
				eq(dailyTransactions.status, 'draft')
			)
		);

	// Get unique supplier IDs
	const supplierIds = [...new Set(drafts.map((d) => d.supplierId))];

	for (const supplierId of supplierIds) {
		// Check if warning already sent today
		const existingWarning = await db
			.select()
			.from(notifications)
			.where(
				and(
					eq(notifications.userId, supplierId),
					eq(notifications.type, 'cutoff_warning'),
					eq(notifications.relatedStoreId, storeId)
				)
			)
			.limit(1);

		// Only send if no warning sent in last hour
		if (existingWarning.length === 0) {
			await db.insert(notifications).values({
				userId: supplierId,
				type: 'cutoff_warning' as NotificationType,
				title: 'Peringatan Batas Waktu',
				message: `Transaksi draft Anda di "${status.storeName}" akan dibatalkan dalam ${status.minutesUntilCutoff} menit jika tidak disetor.`,
				detailUrl: `/app/${storeId}/setor`,
				relatedStoreId: storeId
			});
			notifiedCount++;
		}
	}

	return notifiedCount;
}

// ============================================
// SCHEDULER RUNNER (For API endpoint)
// ============================================

export interface SchedulerRunResult {
	timestamp: string;
	storesChecked: number;
	autoCancelResults: AutoCancelResult[];
	warningsSent: number;
}

/**
 * Run the scheduler - check cutoffs and send warnings
 */
export async function runScheduler(): Promise<SchedulerRunResult> {
	const timestamp = new Date().toISOString();
	const allStores = await db.select().from(stores).where(eq(stores.isOpen, true));

	let totalWarningsSent = 0;

	// Send warnings for stores approaching cutoff
	for (const store of allStores) {
		const warnings = await sendCutoffWarnings(store.id);
		totalWarningsSent += warnings;
	}

	// Auto-cancel for stores past cutoff
	const autoCancelResults = await runAutoCancelForAllStores();

	return {
		timestamp,
		storesChecked: allStores.length,
		autoCancelResults,
		warningsSent: totalWarningsSent
	};
}
