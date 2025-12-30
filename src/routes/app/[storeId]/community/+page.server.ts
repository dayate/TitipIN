import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { localPosts, localComments, users, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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

  // Check membership
  const [membership] = await db
    .select()
    .from(storeMembers)
    .where(and(
      eq(storeMembers.storeId, storeId),
      eq(storeMembers.userId, user.id),
      eq(storeMembers.status, 'active')
    ))
    .limit(1);

  if (!membership && store.ownerId !== user.id) {
    throw error(403, 'Anda bukan anggota lapak ini');
  }

  // Get local posts
  const posts = await db
    .select({
      id: localPosts.id,
      title: localPosts.title,
      content: localPosts.content,
      imageUrl: localPosts.imageUrl,
      isPinned: localPosts.isPinned,
      createdAt: localPosts.createdAt,
      authorId: localPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(localPosts)
    .leftJoin(users, eq(localPosts.authorId, users.id))
    .where(eq(localPosts.storeId, storeId))
    .orderBy(desc(localPosts.isPinned), desc(localPosts.createdAt))
    .limit(50);

  // Get comments for each post
  const postsWithComments = await Promise.all(
    posts.map(async (post) => {
      const comments = await db
        .select({
          id: localComments.id,
          content: localComments.content,
          createdAt: localComments.createdAt,
          authorId: localComments.authorId,
          authorName: users.name,
        })
        .from(localComments)
        .leftJoin(users, eq(localComments.authorId, users.id))
        .where(eq(localComments.postId, post.id))
        .orderBy(desc(localComments.createdAt))
        .limit(20);

      return { ...post, comments };
    })
  );

  return {
    store,
    storeId,
    posts: postsWithComments,
    user,
    isOwner: store.ownerId === user.id,
  };
};
