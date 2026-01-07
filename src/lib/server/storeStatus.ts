/**
 * Store Status History
 *
 * Tracks daily store open/close status for transparency and analytics.
 */

import { db } from './db';
import { dailyStoreStatus, stores } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTodayDate } from '$lib/utils';

/**
 * Log store opening
 */
export async function logStoreOpened(storeId: number): Promise<void> {
	const today = getTodayDate();
	const now = new Date();

	try {
		// Check if we already have a record for today
		const existing = await db
			.select()
			.from(dailyStoreStatus)
			.where(and(eq(dailyStoreStatus.storeId, storeId), eq(dailyStoreStatus.date, today)))
			.limit(1);

		if (existing.length > 0) {
			// Update existing record
			await db
				.update(dailyStoreStatus)
				.set({
					wasOpen: true,
					openedAt: now
				})
				.where(eq(dailyStoreStatus.id, existing[0].id));
		} else {
			// Create new record
			await db.insert(dailyStoreStatus).values({
				storeId,
				date: today,
				wasOpen: true,
				openedAt: now
			});
		}
	} catch (error) {
		console.error('[StoreStatus] Failed to log store opened:', error);
	}
}

/**
 * Log store closing
 */
export async function logStoreClosed(storeId: number): Promise<void> {
	const today = getTodayDate();
	const now = new Date();

	try {
		// Check if we already have a record for today
		const existing = await db
			.select()
			.from(dailyStoreStatus)
			.where(and(eq(dailyStoreStatus.storeId, storeId), eq(dailyStoreStatus.date, today)))
			.limit(1);

		if (existing.length > 0) {
			// Update existing record
			await db
				.update(dailyStoreStatus)
				.set({ closedAt: now })
				.where(eq(dailyStoreStatus.id, existing[0].id));
		} else {
			// Create new record (store was never opened today, just closed)
			await db.insert(dailyStoreStatus).values({
				storeId,
				date: today,
				wasOpen: false,
				closedAt: now
			});
		}
	} catch (error) {
		console.error('[StoreStatus] Failed to log store closed:', error);
	}
}

/**
 * Log emergency store closure
 */
export async function logEmergencyClose(storeId: number, reason?: string): Promise<void> {
	const today = getTodayDate();
	const now = new Date();

	try {
		// Check if we already have a record for today
		const existing = await db
			.select()
			.from(dailyStoreStatus)
			.where(and(eq(dailyStoreStatus.storeId, storeId), eq(dailyStoreStatus.date, today)))
			.limit(1);

		if (existing.length > 0) {
			// Update existing record
			await db
				.update(dailyStoreStatus)
				.set({
					closedAt: now,
					emergencyClose: true,
					emergencyReason: reason
				})
				.where(eq(dailyStoreStatus.id, existing[0].id));
		} else {
			// Create new record
			await db.insert(dailyStoreStatus).values({
				storeId,
				date: today,
				wasOpen: false,
				closedAt: now,
				emergencyClose: true,
				emergencyReason: reason
			});
		}
	} catch (error) {
		console.error('[StoreStatus] Failed to log emergency close:', error);
	}
}

/**
 * Get store status history
 */
export async function getStoreStatusHistory(storeId: number, limit = 30) {
	return db
		.select()
		.from(dailyStoreStatus)
		.where(eq(dailyStoreStatus.storeId, storeId))
		.orderBy(desc(dailyStoreStatus.date))
		.limit(limit);
}

/**
 * Get store status for a specific date
 */
export async function getStoreStatusForDate(storeId: number, date: string) {
	const result = await db
		.select()
		.from(dailyStoreStatus)
		.where(and(eq(dailyStoreStatus.storeId, storeId), eq(dailyStoreStatus.date, date)))
		.limit(1);

	return result[0] || null;
}

/**
 * Get store open days count in last N days
 */
export async function getStoreOpenDaysCount(storeId: number, days = 30): Promise<number> {
	const history = await getStoreStatusHistory(storeId, days);
	return history.filter((h) => h.wasOpen).length;
}
