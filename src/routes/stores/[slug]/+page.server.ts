import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeBranches, storeMembers } from '$lib/server/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { slug } = params;
  const user = locals.user;

  // Get store by slug
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1);

  if (!store) {
    throw error(404, 'Lapak tidak ditemukan');
  }

  // Get branches
  const branches = await db
    .select()
    .from(storeBranches)
    .where(eq(storeBranches.storeId, store.id));

  // Get member count
  const [memberResult] = await db
    .select({ count: count() })
    .from(storeMembers)
    .where(and(
      eq(storeMembers.storeId, store.id),
      eq(storeMembers.status, 'active')
    ));

  // Check user membership status
  let membershipStatus: string | null = null;
  if (user) {
    const [membership] = await db
      .select()
      .from(storeMembers)
      .where(and(
        eq(storeMembers.storeId, store.id),
        eq(storeMembers.userId, user.id)
      ))
      .limit(1);

    membershipStatus = membership?.status || null;
  }

  return {
    store,
    branches,
    memberCount: memberResult?.count || 0,
    membershipStatus,
    user,
  };
};
