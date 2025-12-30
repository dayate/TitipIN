import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeBranches } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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
    throw error(403, 'Hanya pemilik lapak yang bisa mengakses halaman ini');
  }

  // Get branches
  const branches = await db
    .select()
    .from(storeBranches)
    .where(eq(storeBranches.storeId, storeId));

  return {
    store,
    storeId,
    branches,
  };
};
