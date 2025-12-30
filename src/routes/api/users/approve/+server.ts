import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
  try {
    // Check auth
    const sessionId = getSessionId(event);
    if (!sessionId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await event.request.json();

    // Approve user
    await db.update(users)
      .set({ status: 'active' })
      .where(eq(users.id, userId));

    return json({ success: true });
  } catch (error) {
    console.error('Approve user error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
