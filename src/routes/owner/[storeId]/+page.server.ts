import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeBranches, storeMembers, products, users } from '$lib/server/db/schema';
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

  // Check if user is owner
  if (store.ownerId !== user.id) {
    throw error(403, 'Anda bukan pemilik lapak ini');
  }

  // Get branches
  const branches = await db
    .select()
    .from(storeBranches)
    .where(eq(storeBranches.storeId, storeId));

  // Get members with user info
  const members = await db
    .select({
      id: storeMembers.id,
      userId: storeMembers.userId,
      status: storeMembers.status,
      requestMessage: storeMembers.requestMessage,
      joinedAt: storeMembers.joinedAt,
      createdAt: storeMembers.createdAt,
      userName: users.name,
      userWhatsapp: users.whatsapp,
    })
    .from(storeMembers)
    .innerJoin(users, eq(storeMembers.userId, users.id))
    .where(eq(storeMembers.storeId, storeId));

  // Get products count
  const [productCount] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.storeId, storeId));

  // Get pending products count
  const [pendingProductCount] = await db
    .select({ count: count() })
    .from(products)
    .where(and(
      eq(products.storeId, storeId),
      eq(products.status, 'pending')
    ));

  return {
    store,
    branches,
    members,
    stats: {
      totalProducts: productCount?.count || 0,
      pendingProducts: pendingProductCount?.count || 0,
      activeMembers: members.filter(m => m.status === 'active').length,
      pendingMembers: members.filter(m => m.status === 'pending').length,
    },
  };
};
