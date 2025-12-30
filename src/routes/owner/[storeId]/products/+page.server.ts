import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, stores, users } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  const storeId = parseInt(params.storeId);

  if (!user) {
    throw redirect(302, '/auth/login');
  }

  // Get store info
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store) {
    throw error(404, 'Lapak tidak ditemukan');
  }

  // Check if user is owner
  if (store.ownerId !== user.id) {
    throw error(403, 'Hanya pemilik lapak yang bisa mengakses halaman ini');
  }

  // Get all products with supplier info
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      imageUrl: products.imageUrl,
      priceBuy: products.priceBuy,
      priceSell: products.priceSell,
      status: products.status,
      isActive: products.isActive,
      createdAt: products.createdAt,
      supplierId: products.supplierId,
      supplierName: users.name,
    })
    .from(products)
    .innerJoin(users, eq(products.supplierId, users.id))
    .where(eq(products.storeId, storeId));

  const pendingProducts = allProducts.filter(p => p.status === 'pending');
  const approvedProducts = allProducts.filter(p => p.status === 'approved');
  const rejectedProducts = allProducts.filter(p => p.status === 'rejected');

  return {
    store,
    storeId,
    pendingProducts,
    approvedProducts,
    rejectedProducts,
    stats: {
      total: allProducts.length,
      pending: pendingProducts.length,
      approved: approvedProducts.length,
      rejected: rejectedProducts.length,
    },
  };
};
