import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { globalPosts, globalComments, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET: List global posts
export const GET: RequestHandler = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

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
      .limit(limit)
      .offset(offset);

    return json({ posts });
  } catch (error) {
    console.error('Get global posts error:', error);
    return json({ error: 'Gagal mengambil postingan' }, { status: 500 });
  }
};

// POST: Create global post
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, imageUrl } = await request.json();

    if (!title || !content) {
      return json({ error: 'Judul dan isi wajib diisi' }, { status: 400 });
    }

    const [newPost] = await db.insert(globalPosts).values({
      authorId: user.id,
      title,
      content,
      imageUrl: imageUrl || null,
      isPinned: false,
    }).returning();

    return json({
      success: true,
      message: 'Postingan berhasil dibuat',
      post: newPost,
    });
  } catch (error) {
    console.error('Create global post error:', error);
    return json({ error: 'Gagal membuat postingan' }, { status: 500 });
  }
};
