import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(302, '/auth/login');
  }

  const [profile] = await db
    .select({
      id: users.id,
      name: users.name,
      whatsapp: users.whatsapp,
      role: users.role,
      status: users.status,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      address: users.address,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return { profile };
};
