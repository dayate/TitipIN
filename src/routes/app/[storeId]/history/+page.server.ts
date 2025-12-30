import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailyTransactions, transactionItems, products, stores, storeMembers } from '$lib/server/db/schema';
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

  // Check membership
  const [membership] = await db
    .select()
    .from(storeMembers)
    .where(and(
      eq(storeMembers.storeId, storeId),
      eq(storeMembers.userId, user.id),
      eq(storeMembers.status, 'active')
    ))
    .limit(1);

  if (!membership && store.ownerId !== user.id) {
    throw error(403, 'Anda bukan anggota lapak ini');
  }

  // Get transactions for this user in this store
  const transactions = await db
    .select()
    .from(dailyTransactions)
    .where(and(
      eq(dailyTransactions.storeId, storeId),
      eq(dailyTransactions.supplierId, user.id)
    ))
    .orderBy(desc(dailyTransactions.date))
    .limit(30);

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
