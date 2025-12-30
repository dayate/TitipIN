import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stores, storeBranches } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Generate unique invite code (6 characters, uppercase)
function generateInviteCode(): string {
  return nanoid(6).toUpperCase();
}

// GET: List stores (for owner or public)
export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    const ownerId = url.searchParams.get('ownerId');

    let query = db.select().from(stores);

    if (ownerId) {
      query = query.where(eq(stores.ownerId, parseInt(ownerId)));
    }

    const storeList = await query;

    console.log(`[Stores] GET: Found ${storeList.length} stores`);

    return json({ stores: storeList });
  } catch (error) {
    console.error('[Stores] GET Error:', error);
    return json({ error: 'Gagal mengambil daftar lapak' }, { status: 500 });
  }
};

// POST: Create new store
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const user = locals.user;

    console.log(`[Stores] POST: User ${user?.id} attempting to create store`);

    if (!user) {
      console.log('[Stores] POST: Unauthorized - no user');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'owner') {
      console.log(`[Stores] POST: Forbidden - user role is ${user.role}`);
      return json({ error: 'Hanya pemilik lapak yang bisa membuat lapak' }, { status: 403 });
    }

    const { name, slug, description, address, phone, openTime, closeTime } = await request.json();

    console.log(`[Stores] POST: Creating store "${name}" with slug "${slug}"`);

    if (!name || !slug) {
      console.log('[Stores] POST: Validation failed - missing name or slug');
      return json({ error: 'Nama dan slug wajib diisi' }, { status: 400 });
    }

    // Check if slug already exists
    const [existing] = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (existing) {
      console.log(`[Stores] POST: Slug "${slug}" already exists`);
      return json({ error: 'Nama lapak sudah digunakan, pilih nama lain' }, { status: 409 });
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 5) {
      const [existingCode] = await db
        .select()
        .from(stores)
        .where(eq(stores.inviteCode, inviteCode))
        .limit(1);

      if (!existingCode) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    // Create store with invite code
    const [newStore] = await db.insert(stores).values({
      ownerId: user.id,
      name,
      slug,
      description: description || null,
      inviteCode,
      isOpen: false,
      openTime: openTime || '05:00',
      closeTime: closeTime || '10:00',
    }).returning();

    console.log(`[Stores] POST: Store ${newStore.id} created with invite code ${inviteCode}`);

    // Create main branch if address provided
    if (address) {
      await db.insert(storeBranches).values({
        storeId: newStore.id,
        name: 'Cabang Utama',
        address,
        phone: phone || null,
        isMain: true,
        isActive: true,
      });
      console.log(`[Stores] POST: Main branch created for store ${newStore.id}`);
    }

    return json({
      success: true,
      message: 'Lapak berhasil dibuat',
      store: newStore,
    });
  } catch (error) {
    console.error('[Stores] POST Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
