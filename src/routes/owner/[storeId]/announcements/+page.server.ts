import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, notifications, storeMembers, users } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
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

  // Get store announcements (notifications with storeId)
  const announcements = await db
    .select()
    .from(notifications)
    .where(eq(notifications.storeId, storeId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  // Get member count for broadcast info
  const members = await db
    .select({ userId: storeMembers.userId })
    .from(storeMembers)
    .where(and(
      eq(storeMembers.storeId, storeId),
      eq(storeMembers.status, 'active')
    ));

  return {
    store,
    announcements,
    memberCount: members.length,
    storeId,
  };
};
