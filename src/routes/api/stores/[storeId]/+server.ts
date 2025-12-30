import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// PUT: Update store settings
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    console.log(`[Store] User ${user?.id} updating store ${storeId}`);

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

    const { name, description, openTime, closeTime, announcement } = await request.json();

    await db
      .update(stores)
      .set({
        name: name || store.name,
        description: description ?? store.description,
        openTime: openTime || store.openTime,
        closeTime: closeTime || store.closeTime,
        announcement: announcement ?? store.announcement,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    console.log(`[Store] Store ${storeId} updated`);

    return json({
      success: true,
      message: 'Pengaturan berhasil disimpan',
    });
  } catch (error) {
    console.error('[Store] Update error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};

// GET: Get single store details
export const GET: RequestHandler = async ({ params }) => {
  try {
    const storeId = parseInt(params.storeId);

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    return json({ store });
  } catch (error) {
    console.error('[Store] Get error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
