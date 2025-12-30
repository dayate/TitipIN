import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST: Regenerate invite code
export const POST: RequestHandler = async ({ locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    console.log(`[RegenerateCode] User ${user?.id} regenerating code for store ${storeId}`);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if store exists and user is owner
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    if (store.ownerId !== user.id) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate new invite code
    let newCode = nanoid(6).toUpperCase();
    let attempts = 0;
    while (attempts < 5) {
      const [existing] = await db
        .select()
        .from(stores)
        .where(eq(stores.inviteCode, newCode))
        .limit(1);

      if (!existing) break;
      newCode = nanoid(6).toUpperCase();
      attempts++;
    }

    await db
      .update(stores)
      .set({ inviteCode: newCode, updatedAt: new Date() })
      .where(eq(stores.id, storeId));

    console.log(`[RegenerateCode] Store ${storeId} new code: ${newCode}`);

    return json({
      success: true,
      inviteCode: newCode,
      message: 'Kode invite baru berhasil dibuat',
    });
  } catch (error) {
    console.error('[RegenerateCode] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
