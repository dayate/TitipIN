import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { db, users, sessions } from './db';
import { eq, and, gt } from 'drizzle-orm';
import type { User, UserRole } from './db/schema';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

// ============================================
// PASSWORD/PIN HASHING
// ============================================

export async function hashPin(pin: string): Promise<string> {
	return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
	return bcrypt.compare(pin, hash);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export function generateSessionId(): string {
	return nanoid(32);
}

export function getSessionExpiry(): Date {
	const expiry = new Date();
	expiry.setDate(expiry.getDate() + SESSION_DURATION_DAYS);
	return expiry;
}

export async function createSession(userId: number): Promise<string> {
	const sessionId = generateSessionId();
	const expiresAt = getSessionExpiry();

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt
	});

	return sessionId;
}

export async function validateSession(sessionId: string): Promise<{
	user: User;
	session: { id: string; expiresAt: Date };
} | null> {
	const result = await db
		.select()
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	const { sessions: session, users: user } = result[0];

	return {
		user,
		session: {
			id: session.id,
			expiresAt: session.expiresAt
		}
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateAllUserSessions(userId: number): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function createUser(data: {
	name: string;
	whatsapp: string;
	pin: string;
	role: UserRole;
}): Promise<User> {
	const pinHash = await hashPin(data.pin);

	const result = await db
		.insert(users)
		.values({
			name: data.name,
			whatsapp: data.whatsapp,
			pinHash,
			role: data.role,
			status: 'active' // Auto-activate for now
		})
		.returning();

	return result[0];
}

export async function getUserByWhatsapp(whatsapp: string): Promise<User | null> {
	const result = await db.select().from(users).where(eq(users.whatsapp, whatsapp)).limit(1);

	return result[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
	const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

	return result[0] || null;
}

export async function updateUserPin(userId: number, newPin: string): Promise<void> {
	const pinHash = await hashPin(newPin);
	await db.update(users).set({ pinHash }).where(eq(users.id, userId));
}

// ============================================
// AUTHENTICATION
// ============================================

export async function authenticateUser(
	whatsapp: string,
	pin: string
): Promise<{ user: User; sessionId: string } | null> {
	const user = await getUserByWhatsapp(whatsapp);

	if (!user) {
		return null;
	}

	if (user.status !== 'active') {
		return null;
	}

	const isValid = await verifyPin(pin, user.pinHash);

	if (!isValid) {
		return null;
	}

	const sessionId = await createSession(user.id);

	return { user, sessionId };
}
