/**
 * Advanced Reporting Functions
 *
 * Provides report generation for weekly/monthly summaries.
 */

import { db } from './db';
import { dailyTransactions, users, stores, products } from './db/schema';
import { eq, and, gte, lte, sql, count, desc, sum } from 'drizzle-orm';
import { getTodayDate, formatDateISO, formatDate } from '$lib/utils';

// ============================================
// REPORT TYPES
// ============================================

export interface WeeklyReport {
	storeId: number;
	storeName: string;
	period: {
		startDate: string;
		endDate: string;
	};
	summary: {
		totalTransactions: number;
		completedTransactions: number;
		cancelledTransactions: number;
		totalRevenue: number;
		averageDailyRevenue: number;
	};
	topSuppliers: Array<{
		name: string;
		transactions: number;
		revenue: number;
	}>;
	generatedAt: string;
}

export interface MonthlyReport extends WeeklyReport {
	weeklyBreakdown: Array<{
		week: number;
		revenue: number;
		transactions: number;
	}>;
}

// ============================================
// REPORT GENERATION
// ============================================

/**
 * Generate weekly report for a store
 */
export async function generateWeeklyReport(storeId: number, weekOffset = 0): Promise<WeeklyReport> {
	const { startDate, endDate } = getWeekRange(weekOffset);

	// Get store info
	const storeData = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

	const store = storeData[0];
	if (!store) throw new Error('Store not found');

	// Summary data
	const summaryData = await db
		.select({
			totalTransactions: count(),
			completedTransactions: sql<number>`SUM(CASE WHEN ${dailyTransactions.status} = 'completed' THEN 1 ELSE 0 END)`,
			cancelledTransactions: sql<number>`SUM(CASE WHEN ${dailyTransactions.status} = 'cancelled' THEN 1 ELSE 0 END)`,
			totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${dailyTransactions.status} = 'completed' THEN ${dailyTransactions.totalPayout} ELSE 0 END), 0)`
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		);

	const summary = summaryData[0];
	const days = 7;
	const averageDaily = summary?.totalRevenue ? Math.round(summary.totalRevenue / days) : 0;

	// Top suppliers
	const topSuppliers = await db
		.select({
			name: users.name,
			transactions: count(),
			revenue: sql<number>`SUM(${dailyTransactions.totalPayout})`
		})
		.from(dailyTransactions)
		.innerJoin(users, eq(dailyTransactions.supplierId, users.id))
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.status, 'completed'),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		)
		.groupBy(users.id)
		.orderBy(desc(sql`SUM(${dailyTransactions.totalPayout})`))
		.limit(5);

	return {
		storeId,
		storeName: store.name,
		period: { startDate, endDate },
		summary: {
			totalTransactions: summary?.totalTransactions || 0,
			completedTransactions: summary?.completedTransactions || 0,
			cancelledTransactions: summary?.cancelledTransactions || 0,
			totalRevenue: summary?.totalRevenue || 0,
			averageDailyRevenue: averageDaily
		},
		topSuppliers,
		generatedAt: new Date().toISOString()
	};
}

/**
 * Generate monthly report for a store
 */
export async function generateMonthlyReport(
	storeId: number,
	monthOffset = 0
): Promise<MonthlyReport> {
	const { startDate, endDate } = getMonthRange(monthOffset);

	// Get store info
	const storeData = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

	const store = storeData[0];
	if (!store) throw new Error('Store not found');

	// Summary data
	const summaryData = await db
		.select({
			totalTransactions: count(),
			completedTransactions: sql<number>`SUM(CASE WHEN ${dailyTransactions.status} = 'completed' THEN 1 ELSE 0 END)`,
			cancelledTransactions: sql<number>`SUM(CASE WHEN ${dailyTransactions.status} = 'cancelled' THEN 1 ELSE 0 END)`,
			totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${dailyTransactions.status} = 'completed' THEN ${dailyTransactions.totalPayout} ELSE 0 END), 0)`
		})
		.from(dailyTransactions)
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		);

	const summary = summaryData[0];
	const days = getDaysInRange(startDate, endDate);
	const averageDaily = summary?.totalRevenue ? Math.round(summary.totalRevenue / days) : 0;

	// Top suppliers
	const topSuppliers = await db
		.select({
			name: users.name,
			transactions: count(),
			revenue: sql<number>`SUM(${dailyTransactions.totalPayout})`
		})
		.from(dailyTransactions)
		.innerJoin(users, eq(dailyTransactions.supplierId, users.id))
		.where(
			and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.status, 'completed'),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		)
		.groupBy(users.id)
		.orderBy(desc(sql`SUM(${dailyTransactions.totalPayout})`))
		.limit(10);

	// Weekly breakdown
	const weeklyBreakdown = await getWeeklyBreakdown(storeId, startDate, endDate);

	return {
		storeId,
		storeName: store.name,
		period: { startDate, endDate },
		summary: {
			totalTransactions: summary?.totalTransactions || 0,
			completedTransactions: summary?.completedTransactions || 0,
			cancelledTransactions: summary?.cancelledTransactions || 0,
			totalRevenue: summary?.totalRevenue || 0,
			averageDailyRevenue: averageDaily
		},
		topSuppliers,
		weeklyBreakdown,
		generatedAt: new Date().toISOString()
	};
}

/**
 * Get supplier earnings report
 */
export async function generateSupplierEarningsReport(
	supplierId: number,
	startDate: string,
	endDate: string
) {
	const results = await db
		.select({
			date: dailyTransactions.date,
			storeName: stores.name,
			status: dailyTransactions.status,
			payout: dailyTransactions.totalPayout
		})
		.from(dailyTransactions)
		.innerJoin(stores, eq(dailyTransactions.storeId, stores.id))
		.where(
			and(
				eq(dailyTransactions.supplierId, supplierId),
				gte(dailyTransactions.date, startDate),
				lte(dailyTransactions.date, endDate)
			)
		)
		.orderBy(desc(dailyTransactions.date));

	const totalEarnings = results
		.filter((r) => r.status === 'completed')
		.reduce((sum, r) => sum + r.payout, 0);

	return {
		supplierId,
		period: { startDate, endDate },
		totalEarnings,
		transactions: results,
		generatedAt: new Date().toISOString()
	};
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Format report as CSV string
 */
export function reportToCSV(report: WeeklyReport | MonthlyReport): string {
	let csv = 'Rekap Laporan\n';
	csv += `Lapak,${report.storeName}\n`;
	csv += `Periode,${report.period.startDate} - ${report.period.endDate}\n\n`;

	csv += 'Ringkasan\n';
	csv += `Total Transaksi,${report.summary.totalTransactions}\n`;
	csv += `Transaksi Selesai,${report.summary.completedTransactions}\n`;
	csv += `Transaksi Dibatalkan,${report.summary.cancelledTransactions}\n`;
	csv += `Total Pendapatan,Rp ${report.summary.totalRevenue.toLocaleString('id-ID')}\n`;
	csv += `Rata-rata Harian,Rp ${report.summary.averageDailyRevenue.toLocaleString('id-ID')}\n\n`;

	csv += 'Top Supplier\n';
	csv += 'Nama,Transaksi,Pendapatan\n';
	for (const s of report.topSuppliers) {
		csv += `${s.name},${s.transactions},Rp ${s.revenue.toLocaleString('id-ID')}\n`;
	}

	return csv;
}

/**
 * Format report as text for WhatsApp/notification
 */
export function reportToText(report: WeeklyReport): string {
	let text = `📊 *Rekap ${report.storeName}*\n`;
	text += `📅 ${report.period.startDate} - ${report.period.endDate}\n\n`;

	text += `📈 *Ringkasan*\n`;
	text += `• Transaksi: ${report.summary.completedTransactions}/${report.summary.totalTransactions}\n`;
	text += `• Total Pendapatan: Rp ${report.summary.totalRevenue.toLocaleString('id-ID')}\n`;
	text += `• Rata-rata/hari: Rp ${report.summary.averageDailyRevenue.toLocaleString('id-ID')}\n\n`;

	if (report.topSuppliers.length > 0) {
		text += `🏆 *Top 3 Supplier*\n`;
		for (let i = 0; i < Math.min(3, report.topSuppliers.length); i++) {
			const s = report.topSuppliers[i];
			text += `${i + 1}. ${s.name} - Rp ${s.revenue.toLocaleString('id-ID')}\n`;
		}
	}

	return text;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getWeekRange(weekOffset = 0): { startDate: string; endDate: string } {
	const now = new Date();
	now.setDate(now.getDate() - weekOffset * 7);

	// Get Monday of the week
	const dayOfWeek = now.getDay();
	const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

	const monday = new Date(now);
	monday.setDate(diff);

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	return {
		startDate: formatDateISO(monday),
		endDate: formatDateISO(sunday)
	};
}

function getMonthRange(monthOffset = 0): { startDate: string; endDate: string } {
	const now = new Date();
	now.setMonth(now.getMonth() - monthOffset);

	const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

	return {
		startDate: formatDateISO(firstDay),
		endDate: formatDateISO(lastDay)
	};
}

function getDaysInRange(startDate: string, endDate: string): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

async function getWeeklyBreakdown(storeId: number, startDate: string, endDate: string) {
	// Simple weekly breakdown - group by week number
	const results = await db
		.select({
			date: dailyTransactions.date,
			revenue: sql<number>`SUM(${dailyTransactions.totalPayout})`,
			transactions: count()
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

	// Group by week
	const weeks = new Map<number, { revenue: number; transactions: number }>();
	const startWeek = getWeekNumber(new Date(startDate));

	for (const row of results) {
		const weekNum = getWeekNumber(new Date(row.date)) - startWeek + 1;
		const existing = weeks.get(weekNum) || { revenue: 0, transactions: 0 };
		weeks.set(weekNum, {
			revenue: existing.revenue + row.revenue,
			transactions: existing.transactions + row.transactions
		});
	}

	return Array.from(weeks.entries()).map(([week, data]) => ({
		week,
		...data
	}));
}

function getWeekNumber(date: Date): number {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
