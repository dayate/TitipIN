import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// POST: Toggle store open/close
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    console.log(`[Toggle] User ${user?.id} attempting to toggle store ${storeId}`);

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
      console.log(`[Toggle] Store ${storeId} not found`);
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    if (store.ownerId !== user.id) {
      console.log(`[Toggle] User ${user.id} is not owner of store ${storeId}`);
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { isOpen } = await request.json();

    await db
      .update(stores)
      .set({ isOpen, updatedAt: new Date() })
      .where(eq(stores.id, storeId));

    console.log(`[Toggle] Store ${storeId} is now ${isOpen ? 'OPEN' : 'CLOSED'}`);

    return json({
      success: true,
      isOpen,
      message: isOpen ? 'Lapak dibuka' : 'Lapak ditutup',
    });
  } catch (error) {
    console.error('[Toggle] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
