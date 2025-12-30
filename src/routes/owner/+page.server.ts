import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeBranches, storeMembers, products } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return { stores: [], totalBranches: 0, totalMembers: 0, totalProducts: 0 };
  }

  // Get all stores owned by this user
  const ownedStores = await db
    .select()
    .from(stores)
    .where(eq(stores.ownerId, user.id));

  // Calculate totals and add counts to each store
  let totalBranches = 0;
  let totalMembers = 0;
  let totalProducts = 0;

  const storesWithCounts = await Promise.all(
    ownedStores.map(async (store) => {
      // Count branches
      const [branchResult] = await db
        .select({ count: count() })
        .from(storeBranches)
        .where(eq(storeBranches.storeId, store.id));

      // Count members (active only)
      const [memberResult] = await db
        .select({ count: count() })
        .from(storeMembers)
        .where(eq(storeMembers.storeId, store.id));

      // Count products (approved only)
      const [productResult] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.storeId, store.id));

      const branchCount = branchResult?.count || 0;
      const memberCount = memberResult?.count || 0;
      const productCount = productResult?.count || 0;

      totalBranches += branchCount;
      totalMembers += memberCount;
      totalProducts += productCount;

      return {
        ...store,
        branchCount,
        memberCount,
        productCount,
      };
    })
  );

  return {
    stores: storesWithCounts,
    totalBranches,
    totalMembers,
    totalProducts,
  };
};
