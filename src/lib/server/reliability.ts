/**
 * Supplier Reliability Score System
 *
 * Tracks supplier performance metrics for store owners.
 * Score is PRIVATE - not visible to suppliers.
 */

import { db } from './db';
import { supplierStats, users, dailyTransactions, transactionItems, products } from './db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export interface SupplierReliabilityData {
	supplierId: number;
	storeId: number;
	supplierName: string;
	totalTransactions: number;
	completedTransactions: number;
	cancelledBySupplier: number;
	noShowCount: number;
	averageAccuracy: number; // 0-100
	reliabilityScore: number; // 0-100
	totalRevenue: number;
	totalSoldQty: number;
	lastTransactionAt: Date | null;
}

/**
 * Get or create supplier stats for a store
 */
export async function getOrCreateSupplierStats(supplierId: number, storeId: number) {
	const existing = await db
		.select()
		.from(supplierStats)
		.where(
			and(
				eq(supplierStats.supplierId, supplierId),
				eq(supplierStats.storeId, storeId)
			)
		)
		.limit(1);

	if (existing.length > 0) {
		return existing[0];
	}

	// Create new stats record
	const [newStats] = await db
		.insert(supplierStats)
		.values({
			supplierId,
			storeId,
			totalTransactions: 0,
			completedTransactions: 0,
			cancelledBySupplier: 0,
			noShowCount: 0,
			totalPlannedQty: 0,
			totalActualQty: 0,
			totalSoldQty: 0,
			totalRevenue: 0,
			averageAccuracy: 100,
			reliabilityScore: 100
		})
		.returning();

	return newStats;
}

/**
 * Update supplier stats when a transaction is completed
 */
export async function updateSupplierStatsOnComplete(
	supplierId: number,
	storeId: number,
	transaction: {
		plannedQty: number;
		actualQty: number;
		soldQty: number;
		revenue: number;
	}
): Promise<void> {
	const stats = await getOrCreateSupplierStats(supplierId, storeId);

	const newTotalPlanned = stats.totalPlannedQty + transaction.plannedQty;
	const newTotalActual = stats.totalActualQty + transaction.actualQty;
	const newTotalSold = stats.totalSoldQty + transaction.soldQty;
	const newTotalRevenue = stats.totalRevenue + transaction.revenue;
	const newCompleted = stats.completedTransactions + 1;
	const newTotal = stats.totalTransactions + 1;

	// Calculate accuracy: how close actual qty is to planned qty
	const accuracy = newTotalPlanned > 0
		? Math.round((newTotalActual / newTotalPlanned) * 100)
		: 100;

	// Calculate reliability score (weighted formula)
	const completionRate = newTotal > 0 ? (newCompleted / newTotal) * 100 : 100;
	const noShowPenalty = stats.noShowCount * 10;
	const cancelPenalty = stats.cancelledBySupplier * 5;
	const reliabilityScore = Math.max(0, Math.min(100,
		Math.round(completionRate - noShowPenalty - cancelPenalty)
	));

	await db
		.update(supplierStats)
		.set({
			totalTransactions: newTotal,
			completedTransactions: newCompleted,
			totalPlannedQty: newTotalPlanned,
			totalActualQty: newTotalActual,
			totalSoldQty: newTotalSold,
			totalRevenue: newTotalRevenue,
			averageAccuracy: Math.min(100, accuracy),
			reliabilityScore,
			lastTransactionAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(supplierStats.id, stats.id));
}

/**
 * Mark supplier as no-show (didn't submit any products for the day)
 */
export async function markSupplierNoShow(supplierId: number, storeId: number): Promise<void> {
	const stats = await getOrCreateSupplierStats(supplierId, storeId);

	const newNoShowCount = stats.noShowCount + 1;
	const newTotal = stats.totalTransactions + 1;

	// Recalculate reliability score
	const completionRate = newTotal > 0
		? (stats.completedTransactions / newTotal) * 100
		: 100;
	const noShowPenalty = newNoShowCount * 10;
	const cancelPenalty = stats.cancelledBySupplier * 5;
	const reliabilityScore = Math.max(0, Math.min(100,
		Math.round(completionRate - noShowPenalty - cancelPenalty)
	));

	await db
		.update(supplierStats)
		.set({
			totalTransactions: newTotal,
			noShowCount: newNoShowCount,
			reliabilityScore,
			updatedAt: new Date()
		})
		.where(eq(supplierStats.id, stats.id));
}

/**
 * Mark transaction as cancelled by supplier
 */
export async function markSupplierCancelled(supplierId: number, storeId: number): Promise<void> {
	const stats = await getOrCreateSupplierStats(supplierId, storeId);

	const newCancelledCount = stats.cancelledBySupplier + 1;
	const newTotal = stats.totalTransactions + 1;

	// Recalculate reliability score
	const completionRate = newTotal > 0
		? (stats.completedTransactions / newTotal) * 100
		: 100;
	const noShowPenalty = stats.noShowCount * 10;
	const cancelPenalty = newCancelledCount * 5;
	const reliabilityScore = Math.max(0, Math.min(100,
		Math.round(completionRate - noShowPenalty - cancelPenalty)
	));

	await db
		.update(supplierStats)
		.set({
			totalTransactions: newTotal,
			cancelledBySupplier: newCancelledCount,
			reliabilityScore,
			updatedAt: new Date()
		})
		.where(eq(supplierStats.id, stats.id));
}

/**
 * Get all supplier reliability data for a store (for owner dashboard)
 */
export async function getStoreSupplierReliability(storeId: number): Promise<SupplierReliabilityData[]> {
	const results = await db
		.select({
			supplierId: supplierStats.supplierId,
			storeId: supplierStats.storeId,
			supplierName: users.name,
			totalTransactions: supplierStats.totalTransactions,
			completedTransactions: supplierStats.completedTransactions,
			cancelledBySupplier: supplierStats.cancelledBySupplier,
			noShowCount: supplierStats.noShowCount,
			averageAccuracy: supplierStats.averageAccuracy,
			reliabilityScore: supplierStats.reliabilityScore,
			totalRevenue: supplierStats.totalRevenue,
			totalSoldQty: supplierStats.totalSoldQty,
			lastTransactionAt: supplierStats.lastTransactionAt
		})
		.from(supplierStats)
		.innerJoin(users, eq(supplierStats.supplierId, users.id))
		.where(eq(supplierStats.storeId, storeId))
		.orderBy(desc(supplierStats.reliabilityScore));

	return results;
}

/**
 * Get single supplier stats for a store
 */
export async function getSupplierStatsForStore(supplierId: number, storeId: number) {
	const results = await db
		.select()
		.from(supplierStats)
		.where(
			and(
				eq(supplierStats.supplierId, supplierId),
				eq(supplierStats.storeId, storeId)
			)
		)
		.limit(1);

	return results[0] || null;
}

/**
 * Get suppliers with low reliability (for warnings)
 */
export async function getLowReliabilitySuppliers(storeId: number, threshold = 50) {
	const results = await db
		.select({
			supplierId: supplierStats.supplierId,
			supplierName: users.name,
			reliabilityScore: supplierStats.reliabilityScore,
			noShowCount: supplierStats.noShowCount,
			cancelledBySupplier: supplierStats.cancelledBySupplier
		})
		.from(supplierStats)
		.innerJoin(users, eq(supplierStats.supplierId, users.id))
		.where(
			and(
				eq(supplierStats.storeId, storeId),
				sql`${supplierStats.reliabilityScore} < ${threshold}`
			)
		)
		.orderBy(supplierStats.reliabilityScore);

	return results;
}
