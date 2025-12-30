import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: List products for a store
export const GET: RequestHandler = async ({ locals, params, url }) => {
  try {
    const storeId = parseInt(params.storeId);
    const supplierId = url.searchParams.get('supplierId');
    const status = url.searchParams.get('status');

    let query = db.select().from(products).where(eq(products.storeId, storeId));

    const productList = await query;

    // Filter in JS for simplicity (can be optimized with proper query building)
    let filtered = productList;
    if (supplierId) {
      filtered = filtered.filter(p => p.supplierId === parseInt(supplierId));
    }
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    return json({ products: filtered });
  } catch (error) {
    console.error('Get products error:', error);
    return json({ error: 'Gagal mengambil produk' }, { status: 500 });
  }
};

// POST: Create new product
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if store exists
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    // Check if user is member or owner
    const [membership] = await db
      .select()
      .from(storeMembers)
      .where(and(
        eq(storeMembers.storeId, storeId),
        eq(storeMembers.userId, user.id),
        eq(storeMembers.status, 'active')
      ))
      .limit(1);

    if (!membership && store.ownerId !== user.id) {
      return json({ error: 'Anda bukan anggota lapak ini' }, { status: 403 });
    }

    const { name, description, priceBuy, priceSell, imageUrl } = await request.json();

    if (!name || !priceBuy || !priceSell) {
      return json({ error: 'Nama dan harga wajib diisi' }, { status: 400 });
    }

    // Create product with pending status
    const [newProduct] = await db.insert(products).values({
      supplierId: user.id,
      storeId,
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      priceBuy,
      priceSell,
      status: 'pending',
      isActive: true,
    }).returning();

    return json({
      success: true,
      message: 'Produk berhasil diajukan, menunggu persetujuan',
      product: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return json({ error: 'Gagal menambah produk' }, { status: 500 });
  }
};
