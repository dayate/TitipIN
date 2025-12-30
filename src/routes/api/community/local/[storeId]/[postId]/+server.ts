import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { localPosts, stores } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT: Update local post (author only)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);
    const postId = parseInt(params.postId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get post
    const [post] = await db
      .select()
      .from(localPosts)
      .where(and(
        eq(localPosts.id, postId),
        eq(localPosts.storeId, storeId)
      ))
      .limit(1);

    if (!post) {
      return json({ error: 'Post tidak ditemukan' }, { status: 404 });
    }

    // Only author can edit
    if (post.authorId !== user.id) {
      return json({ error: 'Anda tidak bisa mengedit post ini' }, { status: 403 });
    }

    const { title, content, imageUrl, isPinned } = await request.json();

    await db
      .update(localPosts)
      .set({
        ...(title && { title }),
        ...(content && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isPinned !== undefined && { isPinned }),
        updatedAt: new Date(),
      })
      .where(eq(localPosts.id, postId));

    return json({
      success: true,
      message: 'Post berhasil diupdate',
    });
  } catch (error) {
    console.error('Update local post error:', error);
    return json({ error: 'Gagal mengupdate post' }, { status: 500 });
  }
};

// DELETE: Delete local post (author only)
export const DELETE: RequestHandler = async ({ locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);
    const postId = parseInt(params.postId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get post
    const [post] = await db
      .select()
      .from(localPosts)
      .where(and(
        eq(localPosts.id, postId),
        eq(localPosts.storeId, storeId)
      ))
      .limit(1);

    if (!post) {
      return json({ error: 'Post tidak ditemukan' }, { status: 404 });
    }

    // Get store for additional owner check
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

    // Only author or store owner can delete
    if (post.authorId !== user.id && store?.ownerId !== user.id) {
      return json({ error: 'Anda tidak bisa menghapus post ini' }, { status: 403 });
    }

    await db.delete(localPosts).where(eq(localPosts.id, postId));

    return json({
      success: true,
      message: 'Post berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete local post error:', error);
    return json({ error: 'Gagal menghapus post' }, { status: 500 });
  }
};
