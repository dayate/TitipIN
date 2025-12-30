import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { localComments, localPosts, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// POST: Create comment on local post
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);
    const postId = parseInt(params.postId);

    console.log(`[LocalComment] User ${user?.id} commenting on post ${postId} in store ${storeId}`);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if store exists
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
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
      return json({ error: 'Anda bukan anggota lapak ini' }, { status: 403 });
    }

    // Check if post exists
    const [post] = await db
      .select()
      .from(localPosts)
      .where(and(
        eq(localPosts.id, postId),
        eq(localPosts.storeId, storeId)
      ))
      .limit(1);

    if (!post) {
      return json({ error: 'Postingan tidak ditemukan' }, { status: 404 });
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return json({ error: 'Komentar tidak boleh kosong' }, { status: 400 });
    }

    const [newComment] = await db.insert(localComments).values({
      postId,
      authorId: user.id,
      content,
    }).returning();

    console.log(`[LocalComment] Comment ${newComment.id} created`);

    return json({
      success: true,
      message: 'Komentar berhasil dikirim',
      comment: newComment,
    });
  } catch (error) {
    console.error('[LocalComment] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
