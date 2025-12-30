import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT: Update product (by supplier - can only update their own)
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);
    const productId = parseInt(params.productId);

    console.log(`[ProductUpdate] User ${user?.id} updating product ${productId} in store ${storeId}`);

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

    // Check if product exists
    const [product] = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.storeId, storeId)
      ))
      .limit(1);

    if (!product) {
      return json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // Check authorization: owner can update any, supplier can only update own
    const isOwner = store.ownerId === user.id;
    const isProductOwner = product.supplierId === user.id;

    if (!isOwner && !isProductOwner) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Fields that suppliers can update
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    // Only pending products can have price changed by supplier
    if (product.status === 'pending' || isOwner) {
      if (body.priceBuy !== undefined) updates.priceBuy = body.priceBuy;
      if (body.priceSell !== undefined) updates.priceSell = body.priceSell;
    }

    // Only owner can change status
    if (isOwner) {
      if (body.status !== undefined) {
        updates.status = body.status;
        if (body.status === 'approved') {
          updates.isActive = true;
        }
      }
      if (body.isActive !== undefined) updates.isActive = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return json({ error: 'Tidak ada yang diupdate' }, { status: 400 });
    }

    await db
      .update(products)
      .set(updates)
      .where(eq(products.id, productId));

    console.log(`[ProductUpdate] Product ${productId} updated:`, Object.keys(updates));

    return json({
      success: true,
      message: 'Produk berhasil diupdate',
    });
  } catch (error) {
    console.error('[ProductUpdate] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};

// DELETE: Delete product (by supplier - can only delete their own pending)
export const DELETE: RequestHandler = async ({ locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);
    const productId = parseInt(params.productId);

    console.log(`[ProductDelete] User ${user?.id} deleting product ${productId}`);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists
    const [product] = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.storeId, storeId)
      ))
      .limit(1);

    if (!product) {
      return json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // Check if store exists
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    const isOwner = store && store.ownerId === user.id;
    const isProductOwner = product.supplierId === user.id;

    // Supplier can only delete pending products they own
    if (!isOwner) {
      if (!isProductOwner) {
        return json({ error: 'Forbidden' }, { status: 403 });
      }
      if (product.status !== 'pending') {
        return json({ error: 'Hanya produk pending yang bisa dihapus' }, { status: 400 });
      }
    }

    await db.delete(products).where(eq(products.id, productId));

    console.log(`[ProductDelete] Product ${productId} deleted`);

    return json({
      success: true,
      message: 'Produk berhasil dihapus',
    });
  } catch (error) {
    console.error('[ProductDelete] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
