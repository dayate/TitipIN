import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { globalComments, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET: List comments for a post
export const GET: RequestHandler = async ({ params }) => {
  try {
    const postId = parseInt(params.postId);

    const comments = await db
      .select({
        id: globalComments.id,
        content: globalComments.content,
        createdAt: globalComments.createdAt,
        authorId: globalComments.authorId,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
      })
      .from(globalComments)
      .leftJoin(users, eq(globalComments.authorId, users.id))
      .where(eq(globalComments.postId, postId))
      .orderBy(desc(globalComments.createdAt));

    return json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return json({ error: 'Gagal mengambil komentar' }, { status: 500 });
  }
};

// POST: Create comment
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const postId = parseInt(params.postId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content) {
      return json({ error: 'Isi komentar wajib diisi' }, { status: 400 });
    }

    const [newComment] = await db.insert(globalComments).values({
      postId,
      authorId: user.id,
      content,
    }).returning();

    return json({
      success: true,
      message: 'Komentar berhasil ditambahkan',
      comment: newComment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return json({ error: 'Gagal menambah komentar' }, { status: 500 });
  }
};
