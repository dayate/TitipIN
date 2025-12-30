import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notifications, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET: List store announcements
export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const announcements = await db
      .select()
      .from(notifications)
      .where(eq(notifications.storeId, storeId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

// POST: Create announcement and broadcast to all members
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, message, type = 'info' } = await request.json();

    if (!title || !message) {
      return json({ error: 'Judul dan pesan wajib diisi' }, { status: 400 });
    }

    // Get all active members
    const members = await db
      .select({ userId: storeMembers.userId })
      .from(storeMembers)
      .where(and(
        eq(storeMembers.storeId, storeId),
        eq(storeMembers.status, 'active')
      ));

    // Create notifications for all members
    const notificationValues = members.map(member => ({
      userId: member.userId,
      storeId,
      type: type as 'info' | 'warning' | 'success',
      title,
      message,
      isRead: false,
    }));

    // Also create store-level announcement (without userId)
    notificationValues.push({
      userId: null as any,
      storeId,
      type: type as 'info' | 'warning' | 'success',
      title,
      message,
      isRead: false,
    });

    if (notificationValues.length > 0) {
      await db.insert(notifications).values(notificationValues);
    }

    return json({
      success: true,
      message: `Pengumuman berhasil dikirim ke ${members.length} anggota`,
      recipientCount: members.length,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

// DELETE: Delete announcement
export const DELETE: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    if (!store || store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { announcementId } = await request.json();

    if (!announcementId) {
      return json({ error: 'ID pengumuman wajib diisi' }, { status: 400 });
    }

    await db.delete(notifications).where(
      and(
        eq(notifications.id, announcementId),
        eq(notifications.storeId, storeId)
      )
    );

    return json({
      success: true,
      message: 'Pengumuman berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
