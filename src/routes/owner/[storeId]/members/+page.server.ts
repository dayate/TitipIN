import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeMembers, users } from '$lib/server/db/schema';
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

  if (store.ownerId !== user.id) {
    throw error(403, 'Anda bukan pemilik lapak ini');
  }

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
      userAvatar: users.avatarUrl,
    })
    .from(storeMembers)
    .innerJoin(users, eq(storeMembers.userId, users.id))
    .where(eq(storeMembers.storeId, storeId));

  // Generate invite URL
  const inviteUrl = store.inviteCode
    ? `${process.env.PUBLIC_URL || 'http://localhost:5173'}/stores/${store.slug}/join?code=${store.inviteCode}`
    : null;

  return {
    store,
    members,
    inviteUrl,
    storeId,
  };
};
