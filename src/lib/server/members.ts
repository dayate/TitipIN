import { db } from './db';
import { storeMembers, users, stores, type StoreMember } from './db/schema';
import { eq, and, desc, count, inArray } from 'drizzle-orm';

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
		// If rejected and has invite code, delete old and allow rejoin
		if (existing.status === 'rejected' && options?.inviteCode) {
			await db.delete(storeMembers).where(eq(storeMembers.id, existing.id));
		}
		// If rejected and cooldown passed, delete old and allow rejoin
		else if (existing.status === 'rejected' && canRejoinAfterRejection(existing.rejectedAt)) {
			await db.delete(storeMembers).where(eq(storeMembers.id, existing.id));
		}
		// If rejected but cooldown not passed
		else if (existing.status === 'rejected') {
			const days = getRejectionCooldownDays(existing.rejectedAt);
			throw new Error(`Anda harus menunggu ${days} hari lagi untuk mengajukan permintaan bergabung`);
		}
		// Other statuses (active, pending, leaving)
		else {
			throw new Error('Anda sudah terdaftar di lapak ini');
		}
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
			rejectionReason: reason || null,
			rejectedAt: new Date()
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

// Get active member count for a single store
export async function getActiveMemberCount(storeId: number): Promise<number> {
	const [result] = await db
		.select({ count: count() })
		.from(storeMembers)
		.where(and(
			eq(storeMembers.storeId, storeId),
			eq(storeMembers.status, 'active')
		));
	return result?.count || 0;
}

// Get member counts for multiple stores in a single query (BATCH - fixes N+1)
export async function getMemberCountsByStores(storeIds: number[]): Promise<Map<number, number>> {
	if (storeIds.length === 0) return new Map();

	const results = await db
		.select({
			storeId: storeMembers.storeId,
			count: count()
		})
		.from(storeMembers)
		.where(and(
			inArray(storeMembers.storeId, storeIds),
			eq(storeMembers.status, 'active')
		))
		.groupBy(storeMembers.storeId);

	const countMap = new Map<number, number>();
	for (const row of results) {
		countMap.set(row.storeId, row.count);
	}

	// Ensure all requested store IDs have an entry (0 if no members)
	for (const id of storeIds) {
		if (!countMap.has(id)) {
			countMap.set(id, 0);
		}
	}

	return countMap;
}

// Get user's joined stores (active, pending, leaving only - NOT rejected)
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

	// Filter out rejected memberships (they should not appear in "Lapak Saya")
	return memberships.filter(m => m.member.status !== 'rejected');
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

// Check if user can rejoin after rejection (7 day cooldown)
export function canRejoinAfterRejection(rejectedAt: Date | null): boolean {
	if (!rejectedAt) return true;
	const cooldownDays = 7;
	const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
	const now = new Date().getTime();
	const rejectedTime = new Date(rejectedAt).getTime();
	return (now - rejectedTime) >= cooldownMs;
}

// Get remaining cooldown time in milliseconds
export function getRejectionCooldownMs(rejectedAt: Date | null): number {
	if (!rejectedAt) return 0;
	const cooldownDays = 7;
	const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
	const now = new Date().getTime();
	const rejectedTime = new Date(rejectedAt).getTime();
	const remaining = cooldownMs - (now - rejectedTime);
	return Math.max(0, remaining);
}

// Get days remaining for cooldown (for display/error messages)
export function getRejectionCooldownDays(rejectedAt: Date | null): number {
	const remainingMs = getRejectionCooldownMs(rejectedAt);
	return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}

// Request to leave store
export async function requestLeaveStore(memberId: number, reason: string): Promise<StoreMember | null> {
	const [updated] = await db
		.update(storeMembers)
		.set({
			status: 'leaving',
			leaveReason: reason,
			leaveRequestedAt: new Date()
		})
		.where(eq(storeMembers.id, memberId))
		.returning();

	return updated || null;
}

// Approve leave request (delete member)
export async function approveLeaveRequest(memberId: number): Promise<boolean> {
	await db
		.delete(storeMembers)
		.where(eq(storeMembers.id, memberId));

	return true;
}

// Cancel leave request
export async function cancelLeaveRequest(memberId: number): Promise<StoreMember | null> {
	const [updated] = await db
		.update(storeMembers)
		.set({
			status: 'active',
			leaveReason: null,
			leaveRequestedAt: null
		})
		.where(eq(storeMembers.id, memberId))
		.returning();

	return updated || null;
}

// Delete rejected membership (so user can rejoin)
export async function deleteRejectedMembership(memberId: number): Promise<boolean> {
	await db
		.delete(storeMembers)
		.where(eq(storeMembers.id, memberId));

	return true;
}

