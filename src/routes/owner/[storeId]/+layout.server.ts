import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  const storeId = parseInt(params.storeId);

  if (!user) {
    throw redirect(302, '/auth/login');
  }

  // Get store info for sidebar
  const [store] = await db
    .select({
      id: stores.id,
      name: stores.name,
      logoUrl: stores.logoUrl,
      ownerId: stores.ownerId,
    })
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

  return {
    storeId: store.id,
    storeName: store.name,
    logoUrl: store.logoUrl,
    userName: user.name,
    userAvatar: user.avatarUrl,
  };
};

