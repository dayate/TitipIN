import { db } from './db';
import { storeMembers, users, stores, type StoreMember } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Join store (request membership)
export async function joinStore(
	userId: number,
	storeId: number,
	options?: {
		inviteCode?: string;
		message?: string;
		autoApprove?: boolean;
	}
): Promise<StoreMember> {
	// Check if already a member
	const existing = await getMemberByUserAndStore(userId, storeId);
	if (existing) {
		throw new Error('Anda sudah terdaftar di lapak ini');
	}

	const status = options?.autoApprove ? 'active' : 'pending';
	const joinedAt = options?.autoApprove ? new Date() : null;

	const [member] = await db
		.insert(storeMembers)
		.values({
			storeId,
			userId,
			status,
			inviteCodeUsed: options?.inviteCode || null,
			requestMessage: options?.message || null,
			joinedAt
		})
		.returning();

	return member;
}

// Get member by user and store
export async function getMemberByUserAndStore(userId: number, storeId: number): Promise<StoreMember | null> {
	const [member] = await db
		.select()
		.from(storeMembers)
		.where(and(
			eq(storeMembers.userId, userId),
			eq(storeMembers.storeId, storeId)
		))
		.limit(1);

	return member || null;
}

// Get member by ID
export async function getMemberById(memberId: number): Promise<StoreMember | null> {
	const [member] = await db
		.select()
		.from(storeMembers)
		.where(eq(storeMembers.id, memberId))
		.limit(1);

	return member || null;
}

// Approve join request
export async function approveJoinRequest(memberId: number): Promise<StoreMember | null> {
	const [updated] = await db
		.update(storeMembers)
		.set({
			status: 'active',
			joinedAt: new Date()
		})
		.where(eq(storeMembers.id, memberId))
		.returning();

	return updated || null;
}

// Reject join request
export async function rejectJoinRequest(memberId: number, reason?: string): Promise<StoreMember | null> {
	const [updated] = await db
		.update(storeMembers)
		.set({
			status: 'rejected',
			rejectionReason: reason || null
		})
		.where(eq(storeMembers.id, memberId))
		.returning();

	return updated || null;
}

// Kick member (delete membership)
export async function kickMember(memberId: number): Promise<boolean> {
	await db
		.delete(storeMembers)
		.where(eq(storeMembers.id, memberId));

	return true;
}

// Get store members with user info
export async function getStoreMembers(storeId: number, status?: 'pending' | 'active' | 'suspended' | 'rejected') {
	let query = db
		.select({
			member: storeMembers,
			user: {
				id: users.id,
				name: users.name,
				whatsapp: users.whatsapp,
				avatarUrl: users.avatarUrl
			}
		})
		.from(storeMembers)
		.innerJoin(users, eq(storeMembers.userId, users.id))
		.where(eq(storeMembers.storeId, storeId))
		.orderBy(desc(storeMembers.createdAt));

	const results = await query;

	if (status) {
		return results.filter(r => r.member.status === status);
	}

	return results;
}

// Get pending requests
export async function getPendingRequests(storeId: number) {
	return getStoreMembers(storeId, 'pending');
}

// Get active members
export async function getActiveMembers(storeId: number) {
	return getStoreMembers(storeId, 'active');
}

// Get user's joined stores
export async function getUserStores(userId: number) {
	const memberships = await db
		.select({
			member: storeMembers,
			store: stores
		})
		.from(storeMembers)
		.innerJoin(stores, eq(storeMembers.storeId, stores.id))
		.where(eq(storeMembers.userId, userId))
		.orderBy(desc(storeMembers.createdAt));

	return memberships;
}

// Get user's active stores (approved memberships)
export async function getUserActiveStores(userId: number) {
	const memberships = await getUserStores(userId);
	return memberships.filter(m => m.member.status === 'active');
}

// Check if user is active member of store
export async function isActiveMember(userId: number, storeId: number): Promise<boolean> {
	const member = await getMemberByUserAndStore(userId, storeId);
	return member?.status === 'active';
}
