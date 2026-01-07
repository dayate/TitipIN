import { db } from './db';
import {
	dailyTransactions,
	transactionItems,
	products,
	users,
	type DailyTransaction,
	type TransactionStatus
} from './db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

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
	// Build dynamic conditions array for SQL-level filtering
	const conditions = [eq(dailyTransactions.storeId, storeId)];

	if (options?.status) {
		conditions.push(eq(dailyTransactions.status, options.status));
	}

	if (options?.date) {
		conditions.push(eq(dailyTransactions.date, options.date));
	}

	// Apply all conditions at SQL level - much more efficient than JS filtering
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
		.where(and(...conditions))
		.orderBy(desc(dailyTransactions.date), desc(dailyTransactions.createdAt));

	// Apply limit at SQL level if specified
	if (options?.limit) {
		query = query.limit(options.limit) as typeof query;
	}

	return query;
}

// Get transactions by supplier with advanced filters
export async function getSupplierTransactions(
	supplierId: number,
	storeId: number,
	options?: {
		status?: TransactionStatus;
		startDate?: string;
		endDate?: string;
		limit?: number;
	}
) {
	// Build dynamic conditions array for SQL-level filtering
	const conditions = [
		eq(dailyTransactions.supplierId, supplierId),
		eq(dailyTransactions.storeId, storeId)
	];

	if (options?.status) {
		conditions.push(eq(dailyTransactions.status, options.status));
	}

	if (options?.startDate) {
		conditions.push(gte(dailyTransactions.date, options.startDate));
	}

	if (options?.endDate) {
		conditions.push(lte(dailyTransactions.date, options.endDate));
	}

	// Apply all conditions at SQL level
	let query = db
		.select()
		.from(dailyTransactions)
		.where(and(...conditions))
		.orderBy(desc(dailyTransactions.date));

	// Apply limit at SQL level if specified
	if (options?.limit) {
		query = query.limit(options.limit) as typeof query;
	}

	return query;
}

// Delete transactions by IDs
export async function deleteTransactions(transactionIds: number[]): Promise<number> {
	if (transactionIds.length === 0) return 0;

	let deleted = 0;
	for (const id of transactionIds) {
		// First delete all items for this transaction
		await db.delete(transactionItems).where(eq(transactionItems.trxId, id));
		// Then delete the transaction itself
		await db.delete(dailyTransactions).where(eq(dailyTransactions.id, id));
		deleted++;
	}

	return deleted;
}

// Export transactions to CSV format
export function exportTransactionsToCSV(
	transactions: Array<{
		id: number;
		date: string;
		status: string;
		totalItemsIn: number;
		totalItemsSold: number;
		totalPayout: number;
		items: Array<{
			item: { qtyActual: number; qtyReturned: number };
			product: { name: string; priceBuy: number };
		}>;
	}>
): string {
	const headers = ['Tanggal', 'Status', 'Produk', 'Masuk', 'Terjual', 'Retur', 'Keuntungan'];
	const rows: string[][] = [headers];

	for (const trx of transactions) {
		if (trx.items.length === 0) {
			rows.push([trx.date, trx.status, '-', '0', '0', '0', '0']);
		} else {
			for (const { item, product } of trx.items) {
				const qtySold = item.qtyActual - item.qtyReturned;
				const profit = qtySold * product.priceBuy;
				rows.push([
					trx.date,
					trx.status,
					product.name,
					String(item.qtyActual),
					String(qtySold),
					String(item.qtyReturned),
					String(profit)
				]);
			}
		}
	}

	// Convert to CSV string
	return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
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
			and(eq(transactionItems.trxId, data.trxId), eq(transactionItems.productId, data.productId))
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
	const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
	return wib.toISOString().split('T')[0];
}

// Get tomorrow's date string (WIB timezone)
export function getTomorrowDate(): string {
	const now = new Date();
	// Convert to WIB (GMT+7) and add 1 day
	const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
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
