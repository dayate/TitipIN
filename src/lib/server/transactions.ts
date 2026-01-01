import { db } from './db';
import {
	dailyTransactions,
	transactionItems,
	products,
	users,
	type DailyTransaction,
	type TransactionStatus
} from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================
// TRANSACTION CRUD
// ============================================

// Create a new daily transaction
export async function createTransaction(data: {
	date: string; // YYYY-MM-DD
	storeId: number;
	supplierId: number;
	branchId?: number;
}): Promise<DailyTransaction> {
	const [transaction] = await db
		.insert(dailyTransactions)
		.values({
			date: data.date,
			storeId: data.storeId,
			supplierId: data.supplierId,
			branchId: data.branchId || null,
			status: 'draft',
			totalItemsIn: 0,
			totalItemsSold: 0,
			totalPayout: 0
		})
		.returning();

	return transaction;
}

// Get transaction by ID
export async function getTransactionById(trxId: number): Promise<DailyTransaction | null> {
	const [transaction] = await db
		.select()
		.from(dailyTransactions)
		.where(eq(dailyTransactions.id, trxId))
		.limit(1);

	return transaction || null;
}

// Get or create transaction for a date
// DEV MODE: Only reuse transaction if still in draft status, otherwise create new
export async function getOrCreateTransaction(data: {
	date: string;
	storeId: number;
	supplierId: number;
}): Promise<DailyTransaction> {
	// Check if draft transaction exists for this date
	const [existing] = await db
		.select()
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.date, data.date),
				eq(dailyTransactions.storeId, data.storeId),
				eq(dailyTransactions.supplierId, data.supplierId),
				eq(dailyTransactions.status, 'draft') // Only reuse draft transactions
			)
		)
		.limit(1);

	if (existing) {
		return existing;
	}

	// Create new transaction (allows multiple per day if previous ones are verified/completed)
	return createTransaction(data);
}

// Get transactions by store (for admin)
export async function getStoreTransactions(
	storeId: number,
	options?: {
		status?: TransactionStatus;
		date?: string;
		limit?: number;
	}
) {
	let query = db
		.select({
			transaction: dailyTransactions,
			supplier: {
				id: users.id,
				name: users.name,
				whatsapp: users.whatsapp
			}
		})
		.from(dailyTransactions)
		.innerJoin(users, eq(dailyTransactions.supplierId, users.id))
		.where(eq(dailyTransactions.storeId, storeId))
		.orderBy(desc(dailyTransactions.date), desc(dailyTransactions.createdAt));

	const results = await query;

	let filtered = results;

	if (options?.status) {
		filtered = filtered.filter((r) => r.transaction.status === options.status);
	}

	if (options?.date) {
		filtered = filtered.filter((r) => r.transaction.date === options.date);
	}

	if (options?.limit) {
		filtered = filtered.slice(0, options.limit);
	}

	return filtered;
}

// Get transactions by supplier
export async function getSupplierTransactions(
	supplierId: number,
	storeId: number,
	options?: {
		status?: TransactionStatus;
		limit?: number;
	}
) {
	const results = await db
		.select()
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.supplierId, supplierId),
				eq(dailyTransactions.storeId, storeId)
			)
		)
		.orderBy(desc(dailyTransactions.date));

	let filtered = results;

	if (options?.status) {
		filtered = filtered.filter((r) => r.status === options.status);
	}

	if (options?.limit) {
		filtered = filtered.slice(0, options.limit);
	}

	return filtered;
}

// ============================================
// TRANSACTION ITEMS
// ============================================

// Add/update transaction item
export async function upsertTransactionItem(data: {
	trxId: number;
	productId: number;
	qtyPlanned?: number;
	qtyActual?: number;
	qtyReturned?: number;
}) {
	// Check if item exists
	const [existing] = await db
		.select()
		.from(transactionItems)
		.where(
			and(
				eq(transactionItems.trxId, data.trxId),
				eq(transactionItems.productId, data.productId)
			)
		)
		.limit(1);

	if (existing) {
		// Update existing
		const [updated] = await db
			.update(transactionItems)
			.set({
				qtyPlanned: data.qtyPlanned ?? existing.qtyPlanned,
				qtyActual: data.qtyActual ?? existing.qtyActual,
				qtyReturned: data.qtyReturned ?? existing.qtyReturned
			})
			.where(eq(transactionItems.id, existing.id))
			.returning();

		return updated;
	} else {
		// Create new
		const [created] = await db
			.insert(transactionItems)
			.values({
				trxId: data.trxId,
				productId: data.productId,
				qtyPlanned: data.qtyPlanned || 0,
				qtyActual: data.qtyActual || 0,
				qtyReturned: data.qtyReturned || 0
			})
			.returning();

		return created;
	}
}

// Get transaction items with product info
export async function getTransactionItems(trxId: number) {
	return db
		.select({
			item: transactionItems,
			product: {
				id: products.id,
				name: products.name,
				priceBuy: products.priceBuy,
				priceSell: products.priceSell,
				imageUrl: products.imageUrl
			}
		})
		.from(transactionItems)
		.innerJoin(products, eq(transactionItems.productId, products.id))
		.where(eq(transactionItems.trxId, trxId));
}

// Delete transaction item
export async function deleteTransactionItem(itemId: number) {
	await db.delete(transactionItems).where(eq(transactionItems.id, itemId));
	return true;
}

// ============================================
// TRANSACTION STATUS & CALCULATIONS
// ============================================

// Update transaction totals
export async function updateTransactionTotals(trxId: number) {
	const items = await getTransactionItems(trxId);

	let totalItemsIn = 0;
	let totalItemsSold = 0;
	let totalPayout = 0;

	for (const { item, product } of items) {
		totalItemsIn += item.qtyActual;
		const qtySold = item.qtyActual - item.qtyReturned;
		totalItemsSold += qtySold;
		totalPayout += qtySold * product.priceBuy;
	}

	const [updated] = await db
		.update(dailyTransactions)
		.set({
			totalItemsIn,
			totalItemsSold,
			totalPayout
		})
		.where(eq(dailyTransactions.id, trxId))
		.returning();

	return updated;
}

// Update transaction status
export async function updateTransactionStatus(
	trxId: number,
	status: TransactionStatus,
	adminNote?: string
) {
	const [updated] = await db
		.update(dailyTransactions)
		.set({
			status,
			adminNote: adminNote || null
		})
		.where(eq(dailyTransactions.id, trxId))
		.returning();

	return updated;
}

// Verify transaction (admin subuh)
export async function verifyTransaction(trxId: number, adminNote?: string) {
	await updateTransactionTotals(trxId);
	return updateTransactionStatus(trxId, 'verified', adminNote);
}

// Complete transaction (admin pagi after return)
export async function completeTransaction(trxId: number) {
	await updateTransactionTotals(trxId);
	return updateTransactionStatus(trxId, 'completed');
}

// ============================================
// STATISTICS
// ============================================

// Get today's date string (WIB timezone)
export function getTodayDate(): string {
	const now = new Date();
	// Convert to WIB (GMT+7)
	const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
	return wib.toISOString().split('T')[0];
}

// Get tomorrow's date string (WIB timezone)
export function getTomorrowDate(): string {
	const now = new Date();
	// Convert to WIB (GMT+7) and add 1 day
	const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
	wib.setDate(wib.getDate() + 1);
	return wib.toISOString().split('T')[0];
}

// Count transactions by status for a store
export async function countStoreTransactionsByStatus(storeId: number, date?: string) {
	const transactions = await db
		.select()
		.from(dailyTransactions)
		.where(eq(dailyTransactions.storeId, storeId));

	let filtered = transactions;
	if (date) {
		filtered = transactions.filter((t) => t.date === date);
	}

	return {
		total: filtered.length,
		draft: filtered.filter((t) => t.status === 'draft').length,
		verified: filtered.filter((t) => t.status === 'verified').length,
		completed: filtered.filter((t) => t.status === 'completed').length
	};
}
