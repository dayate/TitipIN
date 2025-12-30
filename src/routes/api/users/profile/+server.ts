import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET: Get current user profile
export const GET: RequestHandler = async ({ locals }) => {
  try {
    const user = locals.user;

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
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
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return json({ error: 'Gagal mengambil profil' }, { status: 500 });
  }
};

// PUT: Update user profile
export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, address, avatarUrl } = await request.json();

    if (!name) {
      return json({ error: 'Nama wajib diisi' }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        name,
        bio: bio || null,
        address: address || null,
        avatarUrl: avatarUrl || null,
      })
      .where(eq(users.id, user.id));

    return json({
      success: true,
      message: 'Profil berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
};
