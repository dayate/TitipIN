import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, localPosts, localComments, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
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

  // Get posts with author info
  const posts = await db
    .select({
      id: localPosts.id,
      title: localPosts.title,
      content: localPosts.content,
      imageUrl: localPosts.imageUrl,
      isPinned: localPosts.isPinned,
      createdAt: localPosts.createdAt,
      updatedAt: localPosts.updatedAt,
      authorId: localPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(localPosts)
    .leftJoin(users, eq(localPosts.authorId, users.id))
    .where(eq(localPosts.storeId, storeId))
    .orderBy(desc(localPosts.isPinned), desc(localPosts.createdAt));

  return {
    store,
    posts,
    storeId,
    userId: user.id,
  };
};
