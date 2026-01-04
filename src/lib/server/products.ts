import { db } from './db';
import { products, users, stores, type Product, type ProductStatus } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================
// PRODUCT CRUD
// ============================================

// Create a new product
export async function createProduct(data: {
	supplierId: number;
	storeId: number;
	name: string;
	description?: string;
	imageUrl?: string;
	priceBuy: number;
	priceSell: number;
	suggestedPriceSell?: number;
}): Promise<Product> {
	const [product] = await db
		.insert(products)
		.values({
			supplierId: data.supplierId,
			storeId: data.storeId,
			name: data.name,
			description: data.description || null,
			imageUrl: data.imageUrl || null,
			priceBuy: data.priceBuy,
			priceSell: data.priceSell,
			suggestedPriceSell: data.suggestedPriceSell || null,
			status: 'pending',
			isActive: true
		})
		.returning();

	return product;
}

// Get product by ID
export async function getProductById(productId: number): Promise<Product | null> {
	const [product] = await db
		.select()
		.from(products)
		.where(eq(products.id, productId))
		.limit(1);

	return product || null;
}

// Get products by supplier and store
export async function getSupplierProducts(
	supplierId: number,
	storeId: number,
	status?: ProductStatus
) {
	const results = await db
		.select()
		.from(products)
		.where(
			and(
				eq(products.supplierId, supplierId),
				eq(products.storeId, storeId)
			)
		)
		.orderBy(desc(products.createdAt));

	if (status) {
		return results.filter(p => p.status === status);
	}

	return results;
}

// Get all products for a store (for admin)
export async function getStoreProducts(storeId: number, status?: ProductStatus) {
	const results = await db
		.select({
			product: products,
			supplier: {
				id: users.id,
				name: users.name,
				whatsapp: users.whatsapp
			}
		})
		.from(products)
		.innerJoin(users, eq(products.supplierId, users.id))
		.where(eq(products.storeId, storeId))
		.orderBy(desc(products.createdAt));

	if (status) {
		return results.filter(r => r.product.status === status);
	}

	return results;
}

// Get approved products for a store (for setor)
export async function getApprovedProducts(storeId: number, supplierId?: number) {
	let query = db
		.select()
		.from(products)
		.where(
			and(
				eq(products.storeId, storeId),
				eq(products.status, 'approved'),
				eq(products.isActive, true)
			)
		)
		.orderBy(products.name);

	const results = await query;

	if (supplierId) {
		return results.filter(p => p.supplierId === supplierId);
	}

	return results;
}

// Update product
export async function updateProduct(
	productId: number,
	data: {
		name?: string;
		description?: string;
		imageUrl?: string;
		priceBuy?: number;
		priceSell?: number;
		suggestedPriceSell?: number | null;
		isActive?: boolean;
		status?: 'pending' | 'approved' | 'rejected';
	}
): Promise<Product | null> {
	const [updated] = await db
		.update(products)
		.set(data)
		.where(eq(products.id, productId))
		.returning();

	return updated || null;
}

// Delete product
export async function deleteProduct(productId: number): Promise<boolean> {
	await db.delete(products).where(eq(products.id, productId));
	return true;
}

// ============================================
// PRODUCT APPROVAL (Admin)
// ============================================

// Approve product with price
export async function approveProduct(productId: number, priceSell: number): Promise<Product | null> {
	const [updated] = await db
		.update(products)
		.set({ status: 'approved', priceSell })
		.where(eq(products.id, productId))
		.returning();

	return updated || null;
}

// Reject product
export async function rejectProduct(productId: number): Promise<Product | null> {
	const [updated] = await db
		.update(products)
		.set({ status: 'rejected' })
		.where(eq(products.id, productId))
		.returning();

	return updated || null;
}

// ============================================
// PRODUCT COUNTS
// ============================================

// Count products by status for a store
export async function countStoreProductsByStatus(storeId: number) {
	const allProducts = await db
		.select()
		.from(products)
		.where(eq(products.storeId, storeId));

	return {
		total: allProducts.length,
		pending: allProducts.filter(p => p.status === 'pending').length,
		approved: allProducts.filter(p => p.status === 'approved').length,
		rejected: allProducts.filter(p => p.status === 'rejected').length
	};
}

// Count supplier products in a store
export async function countSupplierProducts(supplierId: number, storeId: number) {
	const allProducts = await db
		.select()
		.from(products)
		.where(
			and(
				eq(products.supplierId, supplierId),
				eq(products.storeId, storeId)
			)
		);

	return {
		total: allProducts.length,
		pending: allProducts.filter(p => p.status === 'pending').length,
		approved: allProducts.filter(p => p.status === 'approved').length,
		rejected: allProducts.filter(p => p.status === 'rejected').length
	};
}
