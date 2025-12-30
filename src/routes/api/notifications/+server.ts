import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

// Get user's notifications
export const GET: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    return json({
      notifications: userNotifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

// Mark notification as read
export const POST: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { notificationId, markAllRead } = await event.request.json();

    if (markAllRead) {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, user.id));
    } else if (notificationId) {
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        ));
    }

    return json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
