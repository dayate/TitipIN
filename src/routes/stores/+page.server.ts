import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeBranches, storeMembers } from '$lib/server/db/schema';
import { eq, count, and } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  // Get all stores with their main branch and member count
  const allStores = await db.select().from(stores);

  const storesWithDetails = await Promise.all(
    allStores.map(async (store) => {
      // Get main branch
      const [mainBranch] = await db
        .select()
        .from(storeBranches)
        .where(and(
          eq(storeBranches.storeId, store.id),
          eq(storeBranches.isMain, true)
        ))
        .limit(1);

      // Count active members
      const [memberResult] = await db
        .select({ count: count() })
        .from(storeMembers)
        .where(and(
          eq(storeMembers.storeId, store.id),
          eq(storeMembers.status, 'active')
        ));

      return {
        ...store,
        mainBranch: mainBranch?.address || null,
        memberCount: memberResult?.count || 0,
      };
    })
  );

  return {
    stores: storesWithDetails,
  };
};
