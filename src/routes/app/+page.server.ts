import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stores, storeMembers, notifications } from '$lib/server/db/schema';
import { eq, and, or, count } from 'drizzle-orm';
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

  // Redirect owner to their dashboard
  if (user.role === 'owner') {
    throw redirect(302, '/owner');
  }

  // Get stores where user is an active member
  const memberships = await db
    .select({
      store: stores,
      memberStatus: storeMembers.status,
      joinedAt: storeMembers.joinedAt,
    })
    .from(storeMembers)
    .innerJoin(stores, eq(storeMembers.storeId, stores.id))
    .where(eq(storeMembers.userId, user.id));

  const activeStores = memberships.filter(m => m.memberStatus === 'active');
  const pendingStores = memberships.filter(m => m.memberStatus === 'pending');

  // Count unread notifications
  const [unreadResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, user.id),
      eq(notifications.isRead, false)
    ));

  return {
    user: {
      id: user.id,
      name: user.name,
      whatsapp: user.whatsapp,
      role: user.role,
    },
    activeStores: activeStores.map(m => m.store),
    pendingStores: pendingStores.map(m => m.store),
    unreadNotifCount: unreadResult?.count || 0,
  };
};
