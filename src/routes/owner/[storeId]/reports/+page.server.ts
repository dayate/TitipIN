import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, dailyTransactions, products, storeMembers } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
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

  if (store.ownerId !== user.id) {
    throw error(403, 'Anda bukan pemilik lapak ini');
  }

  // Get quick stats
  const [productCount] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.storeId, storeId));

  const [memberCount] = await db
    .select({ count: count() })
    .from(storeMembers)
    .where(and(
      eq(storeMembers.storeId, storeId),
      eq(storeMembers.status, 'active')
    ));

  const [transactionCount] = await db
    .select({ count: count() })
    .from(dailyTransactions)
    .where(eq(dailyTransactions.storeId, storeId));

  return {
    store,
    storeId,
    quickStats: {
      products: productCount?.count || 0,
      members: memberCount?.count || 0,
      transactions: transactionCount?.count || 0,
    },
  };
};
