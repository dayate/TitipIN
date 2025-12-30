import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
  const sessionId = getSessionId(event);

  if (!sessionId) {
    throw redirect(302, '/auth/login');
  }

  const user = await validateSession(sessionId);

  if (!user) {
    throw redirect(302, '/auth/login');
  }

  if (user.role === 'admin') {
    throw redirect(302, '/admin');
  }

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return {
    notifications: userNotifications,
  };
};
