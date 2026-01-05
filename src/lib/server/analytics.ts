/**
 * Analytics Functions
 *
 * Provides data aggregation for owner and supplier dashboards.
 */

import { db } from './db';
import {
	dailyTransactions,
	transactionItems,
	products,
	users,
	storeMembers,
	supplierStats
} from './db/schema';
import { eq, and, sql, desc, gte, lte, sum, count } from 'drizzle-orm';
import { getTodayDate, formatDateISO } from '$lib/utils';

// ============================================
// OWNER ANALYTICS
// ============================================

export interface StoreDashboardData {
	totalRevenue: number;
	totalTransactions: number;
	totalSuppliers: number;
	totalProducts: number;
	recentTransactions: Array<{
		date: string;
		supplierName: string;
		totalPayout: number;
		status: string;
	}>;
	topProducts: Array<{
		productName: string;
		totalSold: number;
		revenue: number;
	}>;
	topSuppliers: Array<{
		supplierName: string;
		totalRevenue: number;
		transactionCount: number;
		reliabilityScore: number;
	}>;
}

/**
 * Get overall store dashboard data
 */
export async function getStoreDashboardData(
	storeId: number,
	startDate?: string,
	endDate?: string
): Promise<StoreDashboardData> {
	const today = getTodayDate();
	const start = startDate || getDateNDaysAgo(30);
	const end = endDate || today;

	// Total revenue and transaction count
	const revenueData = await db
		.select({
			totalRevenue: sql<number>`COALESCE(SUM(${dailyTransactions.totalPayout}), 0)`,
			totalTransactions: count()
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.status, 'completed'),
				gte(dailyTransactions.date, start),
				lte(dailyTransactions.date, end)
			)
		);

	// Total active suppliers
	const supplierCount = await db
		.select({ count: count() })
		.from(storeMembers)
		.where(
			and(
				eq(storeMembers.storeId, storeId),
				eq(storeMembers.status, 'active')
			)
		);

	// Total products
	const productCount = await db
		.select({ count: count() })
		.from(products)
		.where(
			and(
				eq(products.storeId, storeId),
				eq(products.status, 'approved')
			)
		);

	// Recent transactions
	const recentTransactions = await db
		.select({
			date: dailyTransactions.date,
			supplierName: users.name,
			totalPayout: dailyTransactions.totalPayout,
			status: dailyTransactions.status
		})
		.from(dailyTransactions)
		.innerJoin(users, eq(dailyTransactions.supplierId, users.id))
		.where(eq(dailyTransactions.storeId, storeId))
		.orderBy(desc(dailyTransactions.date))
		.limit(10);

	// Top suppliers by revenue
	const topSuppliers = await db
		.select({
			supplierName: users.name,
			totalRevenue: supplierStats.totalRevenue,
			transactionCount: supplierStats.completedTransactions,
			reliabilityScore: supplierStats.reliabilityScore
		})
		.from(supplierStats)
		.innerJoin(users, eq(supplierStats.supplierId, users.id))
		.where(eq(supplierStats.storeId, storeId))
		.orderBy(desc(supplierStats.totalRevenue))
		.limit(5);

	return {
		totalRevenue: revenueData[0]?.totalRevenue || 0,
		totalTransactions: revenueData[0]?.totalTransactions || 0,
		totalSuppliers: supplierCount[0]?.count || 0,
		totalProducts: productCount[0]?.count || 0,
		recentTransactions,
		topProducts: [], // TODO: Implement when items are tracked better
		topSuppliers
	};
}

/**
 * Get revenue by period (for charts)
 */
export async function getRevenueByPeriod(
	storeId: number,
	startDate: string,
	endDate: string,
	groupBy: 'day' | 'week' | 'month' = 'day'
) {
	const results = await db
		.select({
			date: dailyTransactions.date,
			revenue: sql<number>`SUM(${dailyTransactions.totalPayout})`,
			transactionCount: count()
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.status, 'completed'),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		)
		.groupBy(dailyTransactions.date)
		.orderBy(dailyTransactions.date);

	return results;
}

// ============================================
// SUPPLIER ANALYTICS
// ============================================

export interface SupplierDashboardData {
	totalEarnings: number;
	totalTransactions: number;
	totalProductsSold: number;
	storeBreakdown: Array<{
		storeId: number;
		storeName: string;
		earnings: number;
		transactionCount: number;
	}>;
	recentTransactions: Array<{
		date: string;
		storeName: string;
		payout: number;
		status: string;
	}>;
}

/**
 * Get supplier dashboard data
 */
export async function getSupplierDashboardData(
	supplierId: number,
	startDate?: string,
	endDate?: string
): Promise<SupplierDashboardData> {
	const today = getTodayDate();
	const start = startDate || getDateNDaysAgo(30);
	const end = endDate || today;

	// Total earnings
	const earningsData = await db
		.select({
			totalEarnings: sql<number>`COALESCE(SUM(${dailyTransactions.totalPayout}), 0)`,
			totalTransactions: count()
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.supplierId, supplierId),
				eq(dailyTransactions.status, 'completed'),
				gte(dailyTransactions.date, start),
				lte(dailyTransactions.date, end)
			)
		);

	// Total products sold
	const soldData = await db
		.select({
			totalSold: sql<number>`COALESCE(SUM(${supplierStats.totalSoldQty}), 0)`
		})
		.from(supplierStats)
		.where(eq(supplierStats.supplierId, supplierId));

	// Recent transactions
	const { stores } = await import('./db/schema');
	const recentTransactions = await db
		.select({
			date: dailyTransactions.date,
			storeName: stores.name,
			payout: dailyTransactions.totalPayout,
			status: dailyTransactions.status
		})
		.from(dailyTransactions)
		.innerJoin(stores, eq(dailyTransactions.storeId, stores.id))
		.where(eq(dailyTransactions.supplierId, supplierId))
		.orderBy(desc(dailyTransactions.date))
		.limit(10);

	return {
		totalEarnings: earningsData[0]?.totalEarnings || 0,
		totalTransactions: earningsData[0]?.totalTransactions || 0,
		totalProductsSold: soldData[0]?.totalSold || 0,
		storeBreakdown: [], // TODO: Implement
		recentTransactions
	};
}

/**
 * Get supplier earnings by store
 */
export async function getSupplierEarningsByStore(supplierId: number) {
	const { stores } = await import('./db/schema');

	return db
		.select({
			storeId: supplierStats.storeId,
			storeName: stores.name,
			totalRevenue: supplierStats.totalRevenue,
			completedTransactions: supplierStats.completedTransactions,
			totalSoldQty: supplierStats.totalSoldQty
		})
		.from(supplierStats)
		.innerJoin(stores, eq(supplierStats.storeId, stores.id))
		.where(eq(supplierStats.supplierId, supplierId))
		.orderBy(desc(supplierStats.totalRevenue));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDateNDaysAgo(n: number): string {
	const date = new Date();
	date.setDate(date.getDate() - n);
	return formatDateISO(date);
}

/**
 * Get transaction summary for a period
 */
export async function getTransactionSummary(storeId: number, startDate: string, endDate: string) {
	const results = await db
		.select({
			status: dailyTransactions.status,
			count: count(),
			totalPayout: sql<number>`SUM(${dailyTransactions.totalPayout})`
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		)
		.groupBy(dailyTransactions.status);

	return results;
}
