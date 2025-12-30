import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { globalPosts, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const posts = await db
    .select({
      id: globalPosts.id,
      title: globalPosts.title,
      content: globalPosts.content,
      imageUrl: globalPosts.imageUrl,
      isPinned: globalPosts.isPinned,
      createdAt: globalPosts.createdAt,
      authorId: globalPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(globalPosts)
    .leftJoin(users, eq(globalPosts.authorId, users.id))
    .orderBy(desc(globalPosts.isPinned), desc(globalPosts.createdAt))
    .limit(50);

  return {
    posts,
    user: locals.user,
  };
};
