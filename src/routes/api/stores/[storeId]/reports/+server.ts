import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stores, dailyTransactions, transactionItems, products, storeMembers, users } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

// GET: Get report data for charts
export const GET: RequestHandler = async ({ locals, params, url }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get date range from query params
    const period = url.searchParams.get('period') || 'week'; // week, month, year
    const today = new Date();
    let dateFrom: string;

    if (period === 'month') {
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 30);
      dateFrom = fromDate.toISOString().split('T')[0];
    } else if (period === 'year') {
      const fromDate = new Date(today);
      fromDate.setFullYear(today.getFullYear() - 1);
      dateFrom = fromDate.toISOString().split('T')[0];
    } else {
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 7);
      dateFrom = fromDate.toISOString().split('T')[0];
    }

    const dateTo = today.toISOString().split('T')[0];

    // Get transactions in date range
    const transactions = await db
      .select({
        date: dailyTransactions.date,
        totalItemsIn: dailyTransactions.totalItemsIn,
        totalItemsSold: dailyTransactions.totalItemsSold,
        totalPayout: dailyTransactions.totalPayout,
        status: dailyTransactions.status,
        supplierId: dailyTransactions.supplierId,
        supplierName: users.name,
      })
      .from(dailyTransactions)
      .leftJoin(users, eq(dailyTransactions.supplierId, users.id))
      .where(and(
        eq(dailyTransactions.storeId, storeId),
        gte(dailyTransactions.date, dateFrom),
        lte(dailyTransactions.date, dateTo)
      ))
      .orderBy(dailyTransactions.date);

    // Aggregate by date for chart
    const dailyData = new Map<string, {
      date: string;
      itemsIn: number;
      itemsSold: number;
      payout: number;
      transactions: number;
    }>();

    transactions.forEach(tx => {
      const existing = dailyData.get(tx.date);
      if (existing) {
        existing.itemsIn += tx.totalItemsIn;
        existing.itemsSold += tx.totalItemsSold;
        existing.payout += tx.totalPayout;
        existing.transactions += 1;
      } else {
        dailyData.set(tx.date, {
          date: tx.date,
          itemsIn: tx.totalItemsIn,
          itemsSold: tx.totalItemsSold,
          payout: tx.totalPayout,
          transactions: 1,
        });
      }
    });

    // Get top products
    const topProducts = await db
      .select({
        productId: transactionItems.productId,
        productName: products.name,
        totalSold: sql<number>`SUM(${transactionItems.qtyActual} - ${transactionItems.qtyReturned})`,
      })
      .from(transactionItems)
      .innerJoin(dailyTransactions, eq(transactionItems.trxId, dailyTransactions.id))
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .where(and(
        eq(dailyTransactions.storeId, storeId),
        gte(dailyTransactions.date, dateFrom),
        lte(dailyTransactions.date, dateTo)
      ))
      .groupBy(transactionItems.productId, products.name)
      .orderBy(desc(sql`SUM(${transactionItems.qtyActual} - ${transactionItems.qtyReturned})`))
      .limit(5);

    // Get supplier stats
    const supplierStats = new Map<string, { name: string; payout: number; itemsSold: number }>();
    transactions.forEach(tx => {
      const name = tx.supplierName || 'Unknown';
      const existing = supplierStats.get(name);
      if (existing) {
        existing.payout += tx.totalPayout;
        existing.itemsSold += tx.totalItemsSold;
      } else {
        supplierStats.set(name, {
          name,
          payout: tx.totalPayout,
          itemsSold: tx.totalItemsSold,
        });
      }
    });

    // Summary stats
    const summary = {
      totalTransactions: transactions.length,
      totalItemsIn: transactions.reduce((sum, tx) => sum + tx.totalItemsIn, 0),
      totalItemsSold: transactions.reduce((sum, tx) => sum + tx.totalItemsSold, 0),
      totalPayout: transactions.reduce((sum, tx) => sum + tx.totalPayout, 0),
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
    };

    return json({
      summary,
      chartData: Array.from(dailyData.values()),
      topProducts,
      supplierStats: Array.from(supplierStats.values()),
      period,
      dateRange: { from: dateFrom, to: dateTo },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
