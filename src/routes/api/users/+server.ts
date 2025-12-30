import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

// Delete user
export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await event.request.json();

    if (!userId) {
      return json({ error: 'User ID required' }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, userId));

    return json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
