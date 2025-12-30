import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyTransactions, transactionItems, products, stores, users } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  const storeId = parseInt(params.storeId);

  if (!user) {
    throw redirect(302, '/auth/login');
  }

  // Get store info
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store) {
    throw error(404, 'Lapak tidak ditemukan');
  }

  // Check if user is owner
  if (store.ownerId !== user.id) {
    throw error(403, 'Anda bukan pemilik lapak ini');
  }

  // Get all transactions for this store (with supplier info)
  const transactions = await db
    .select({
      id: dailyTransactions.id,
      date: dailyTransactions.date,
      status: dailyTransactions.status,
      totalItemsIn: dailyTransactions.totalItemsIn,
      totalItemsSold: dailyTransactions.totalItemsSold,
      totalPayout: dailyTransactions.totalPayout,
      supplierId: dailyTransactions.supplierId,
      adminNote: dailyTransactions.adminNote,
      createdAt: dailyTransactions.createdAt,
      supplierName: users.name,
      supplierWhatsapp: users.whatsapp,
    })
    .from(dailyTransactions)
    .innerJoin(users, eq(dailyTransactions.supplierId, users.id))
    .where(eq(dailyTransactions.storeId, storeId))
    .orderBy(desc(dailyTransactions.date))
    .limit(50);

  // Get items for each transaction
  const transactionsWithItems = await Promise.all(
    transactions.map(async (tx) => {
      const items = await db
        .select({
          id: transactionItems.id,
          productId: transactionItems.productId,
          qtyPlanned: transactionItems.qtyPlanned,
          qtyActual: transactionItems.qtyActual,
          qtyReturned: transactionItems.qtyReturned,
          productName: products.name,
          priceBuy: products.priceBuy,
        })
        .from(transactionItems)
        .innerJoin(products, eq(transactionItems.productId, products.id))
        .where(eq(transactionItems.trxId, tx.id));

      return { ...tx, items };
    })
  );

  return {
    store,
    storeId,
    transactions: transactionsWithItems,
  };
};
