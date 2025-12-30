import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeMembers, products, dailyTransactions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
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

  // Check if user is a member or owner
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

  // Get user's approved products for this store
  const userProducts = await db
    .select()
    .from(products)
    .where(and(
      eq(products.storeId, storeId),
      eq(products.supplierId, user.id),
      eq(products.status, 'approved'),
      eq(products.isActive, true)
    ));

  // Get today's stats
  const today = new Date().toISOString().split('T')[0];
  const [todayTx] = await db
    .select()
    .from(dailyTransactions)
    .where(and(
      eq(dailyTransactions.storeId, storeId),
      eq(dailyTransactions.supplierId, user.id),
      eq(dailyTransactions.date, today)
    ))
    .limit(1);

  return {
    store,
    storeId,
    products: userProducts,
    todayStats: todayTx ? {
      totalIn: todayTx.totalItemsIn,
      totalSold: todayTx.totalItemsSold,
      totalReturned: todayTx.totalItemsIn - todayTx.totalItemsSold,
      totalPayout: todayTx.totalPayout,
      status: todayTx.status,
    } : {
      totalIn: 0,
      totalSold: 0,
      totalReturned: 0,
      totalPayout: 0,
      status: null,
    },
  };
};
