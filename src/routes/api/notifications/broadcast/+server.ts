import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notifications, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

// Broadcast notification to all suppliers
export const POST: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, message } = await event.request.json();

    if (!title || !message) {
      return json({ error: 'Title dan message wajib diisi' }, { status: 400 });
    }

    // Get all suppliers
    const suppliers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'supplier'));

    // Create notification for each supplier
    for (const supplier of suppliers) {
      db.insert(notifications).values({
        userId: supplier.id,
        type: 'info',
        title,
        message,
        isRead: false,
      }).run();
    }

    return json({ success: true, count: suppliers.length });
  } catch (error) {
    console.error('Broadcast error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
