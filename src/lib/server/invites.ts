import { db } from './db';
import { storeInvites, stores, type StoreInvite } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Generate unique invite code
function generateInviteCode(): string {
	return nanoid(8).toUpperCase();
}

// Create invite code
export async function createInviteCode(
	storeId: number,
	createdBy: number,
	options?: {
		expiresInHours?: number;
		maxUses?: number;
	}
): Promise<StoreInvite> {
	const expiresInHours = options?.expiresInHours || 24 * 7; // Default 7 days
	const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

	const [invite] = await db
		.insert(storeInvites)
		.values({
			storeId,
			code: generateInviteCode(),
			createdBy,
			expiresAt,
			maxUses: options?.maxUses || 0,
			usedCount: 0,
			isActive: true
		})
		.returning();

	return invite;
}

// Get active invite code for store
export async function getActiveInviteCode(storeId: number): Promise<StoreInvite | null> {
	const [invite] = await db
		.select()
		.from(storeInvites)
		.where(and(
			eq(storeInvites.storeId, storeId),
			eq(storeInvites.isActive, true),
			gt(storeInvites.expiresAt, new Date())
		))
		.limit(1);

	return invite || null;
}

// Get invite by code
export async function getInviteByCode(code: string): Promise<StoreInvite | null> {
	const [invite] = await db
		.select()
		.from(storeInvites)
		.where(eq(storeInvites.code, code.toUpperCase()))
		.limit(1);

	return invite || null;
}

// Validate invite code
export async function validateInviteCode(code: string): Promise<{
	valid: boolean;
	invite?: StoreInvite;
	store?: typeof stores.$inferSelect;
	error?: string;
}> {
	const invite = await getInviteByCode(code);

	if (!invite) {
		return { valid: false, error: 'Kode undangan tidak ditemukan' };
	}

	if (!invite.isActive) {
		return { valid: false, error: 'Kode undangan sudah tidak aktif' };
	}

	if (new Date() > invite.expiresAt) {
		return { valid: false, error: 'Kode undangan sudah kadaluarsa' };
	}

	if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
		return { valid: false, error: 'Kode undangan sudah mencapai batas penggunaan' };
	}

	// Get store info
	const [store] = await db
		.select()
		.from(stores)
		.where(eq(stores.id, invite.storeId))
		.limit(1);

	if (!store) {
		return { valid: false, error: 'Lapak tidak ditemukan' };
	}

	return { valid: true, invite, store };
}

// Use invite code (increment counter)
export async function useInviteCode(code: string): Promise<boolean> {
	const invite = await getInviteByCode(code);
	if (!invite) return false;

	await db
		.update(storeInvites)
		.set({ usedCount: invite.usedCount + 1 })
		.where(eq(storeInvites.id, invite.id));

	return true;
}

// Regenerate invite code (deactivate old, create new)
export async function regenerateInviteCode(
	storeId: number,
	createdBy: number,
	options?: {
		expiresInHours?: number;
		maxUses?: number;
	}
): Promise<StoreInvite> {
	// Deactivate all existing codes for this store
	await db
		.update(storeInvites)
		.set({ isActive: false })
		.where(eq(storeInvites.storeId, storeId));

	// Create new code
	return createInviteCode(storeId, createdBy, options);
}

// Deactivate invite code
export async function deactivateInviteCode(inviteId: number): Promise<boolean> {
	await db
		.update(storeInvites)
		.set({ isActive: false })
		.where(eq(storeInvites.id, inviteId));

	return true;
}

// Get invite URL
export function getInviteUrl(code: string, baseUrl: string): string {
	return `${baseUrl}/join/${code}`;
}
