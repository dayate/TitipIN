import { db } from './db';
import { stores, storeMembers, users, type Store, type NewStore } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { slugify } from '$lib/utils';

// Create a new store
export async function createStore(ownerId: number, data: {
	name: string;
	description?: string;
	visibility?: 'public' | 'private';
}): Promise<Store> {
	const slug = slugify(data.name) + '-' + Date.now().toString(36);

	const [store] = await db
		.insert(stores)
		.values({
			ownerId,
			name: data.name,
			slug,
			description: data.description || null,
			visibility: data.visibility || 'private',
			isOpen: true,
			autoApprove: true
		})
		.returning();

	return store;
}

// Get stores by owner
export async function getStoresByOwner(ownerId: number): Promise<Store[]> {
	return db
		.select()
		.from(stores)
		.where(eq(stores.ownerId, ownerId))
		.orderBy(desc(stores.createdAt));
}

// Get store by ID
export async function getStoreById(storeId: number): Promise<Store | null> {
	const [store] = await db
		.select()
		.from(stores)
		.where(eq(stores.id, storeId))
		.limit(1);

	return store || null;
}

// Get store by slug
export async function getStoreBySlug(slug: string): Promise<Store | null> {
	const [store] = await db
		.select()
		.from(stores)
		.where(eq(stores.slug, slug))
		.limit(1);

	return store || null;
}

// Get all public stores
export async function getPublicStores(): Promise<Store[]> {
	return db
		.select()
		.from(stores)
		.where(eq(stores.visibility, 'public'))
		.orderBy(desc(stores.createdAt));
}

// Update store
export async function updateStore(storeId: number, data: Partial<{
	name: string;
	description: string | null;
	phone: string | null;
	address: string | null;
	operatingDays: string | null;
	visibility: 'public' | 'private';
	isOpen: boolean;
	autoApprove: boolean;
	emergencyMode: boolean;
	announcement: string | null;
	openTime: string | null;
	closeTime: string | null;
	// Cut-off settings
	cutoffTime: string | null;
	autoCancelEnabled: boolean;
	cutoffGracePeriod: number;
}>): Promise<Store | null> {

	const [updated] = await db
		.update(stores)
		.set({
			...data,
			updatedAt: new Date()
		})
		.where(eq(stores.id, storeId))
		.returning();

	return updated || null;
}

// Delete store
export async function deleteStore(storeId: number): Promise<boolean> {
	try {
		const result = await db
			.delete(stores)
			.where(eq(stores.id, storeId));

		// SQLite returns { changes: number } for delete operations
		return true; // If no error thrown, delete succeeded
	} catch (error) {
		console.error('Failed to delete store:', error);
		return false;
	}
}

// Toggle store open/close status
export async function toggleStoreStatus(storeId: number, isOpen: boolean): Promise<Store | null> {
	return updateStore(storeId, { isOpen });
}

// Toggle auto approve
export async function toggleAutoApprove(storeId: number, autoApprove: boolean): Promise<Store | null> {
	return updateStore(storeId, { autoApprove });
}

// Check if user is store owner
export async function isStoreOwner(storeId: number, userId: number): Promise<boolean> {
	const store = await getStoreById(storeId);
	return store?.ownerId === userId;
}

// Get store with full stats
export async function getStoreWithStats(storeId: number) {
	const store = await getStoreById(storeId);
	if (!store) return null;

	const members = await db
		.select()
		.from(storeMembers)
		.where(and(
			eq(storeMembers.storeId, storeId),
			eq(storeMembers.status, 'active')
		));

	const pending = await db
		.select()
		.from(storeMembers)
		.where(and(
			eq(storeMembers.storeId, storeId),
			eq(storeMembers.status, 'pending')
		));

	// Import products and transactions tables
	const { products, dailyTransactions } = await import('./db/schema');

	const productList = await db
		.select()
		.from(products)
		.where(eq(products.storeId, storeId));

	const transactionList = await db
		.select()
		.from(dailyTransactions)
		.where(eq(dailyTransactions.storeId, storeId));

	// Calculate total revenue
	const totalRevenue = transactionList
		.filter(t => t.status === 'completed')
		.reduce((sum, t) => sum + t.totalPayout, 0);

	return {
		...store,
		memberCount: members.length,
		pendingCount: pending.length,
		productCount: productList.length,
		transactionCount: transactionList.length,
		totalRevenue
	};
}

// Get all stores with stats for an owner
export async function getStoresWithStats(ownerId: number) {
	const ownerStores = await getStoresByOwner(ownerId);

	return Promise.all(
		ownerStores.map(async (store) => {
			const stats = await getStoreWithStats(store.id);
			return stats!;
		})
	);
}
