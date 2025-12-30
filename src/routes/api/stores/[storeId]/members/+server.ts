import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { storeMembers, stores, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: List members of a store
export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner of this store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all members with user info
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
      })
      .from(storeMembers)
      .innerJoin(users, eq(storeMembers.userId, users.id))
      .where(eq(storeMembers.storeId, storeId));

    return json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};

// PUT: Update member status (approve/reject/suspend)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner of this store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { memberId, status } = await request.json();

    if (!memberId || !status) {
      return json({ error: 'Member ID dan status wajib diisi' }, { status: 400 });
    }

    const validStatuses = ['active', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // Update member status
    const joinedAt = status === 'active' ? new Date() : null;

    await db
      .update(storeMembers)
      .set({
        status,
        joinedAt: joinedAt ? joinedAt : undefined,
      })
      .where(and(
        eq(storeMembers.id, memberId),
        eq(storeMembers.storeId, storeId)
      ));

    return json({
      success: true,
      message: status === 'active' ? 'Anggota berhasil disetujui' : 'Status berhasil diubah',
    });
  } catch (error) {
    console.error('Update member error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};

// DELETE: Remove member from store
export const DELETE: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner of this store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { memberId } = await request.json();

    if (!memberId) {
      return json({ error: 'Member ID wajib diisi' }, { status: 400 });
    }

    await db
      .delete(storeMembers)
      .where(and(
        eq(storeMembers.id, memberId),
        eq(storeMembers.storeId, storeId)
      ));

    return json({
      success: true,
      message: 'Anggota berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete member error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
