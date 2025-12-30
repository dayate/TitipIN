import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { localPosts, localComments, users, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET: List local posts for a store
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const storeId = parseInt(params.storeId);
    const user = locals.user;

    // Check if user is member or owner
    if (user) {
      const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
      const [membership] = await db
        .select()
        .from(storeMembers)
        .where(and(
          eq(storeMembers.storeId, storeId),
          eq(storeMembers.userId, user.id),
          eq(storeMembers.status, 'active')
        ))
        .limit(1);

      if (!membership && store?.ownerId !== user.id) {
        return json({ error: 'Anda bukan anggota lapak ini' }, { status: 403 });
      }
    } else {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      .orderBy(desc(localPosts.isPinned), desc(localPosts.createdAt));

    return json({ posts });
  } catch (error) {
    console.error('Get local posts error:', error);
    return json({ error: 'Gagal mengambil postingan' }, { status: 500 });
  }
};

// POST: Create local post (Owner Only)
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get store and check if user is owner
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    // Only owner can create posts
    if (store.ownerId !== user.id) {
      return json({ error: 'Hanya pemilik lapak yang bisa membuat pengumuman' }, { status: 403 });
    }

    const { title, content, imageUrl } = await request.json();

    if (!title || !content) {
      return json({ error: 'Judul dan isi wajib diisi' }, { status: 400 });
    }

    const [newPost] = await db.insert(localPosts).values({
      storeId,
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
    console.error('Create local post error:', error);
    return json({ error: 'Gagal membuat postingan' }, { status: 500 });
  }
};
