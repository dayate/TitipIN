import { db } from './db';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import type { RequestEvent } from '@sveltejs/kit';

const SESSION_EXPIRY_DAYS = 30;

// Hash PIN
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

// Verify PIN
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

// Create Session
export async function createSession(userId: number): Promise<string> {
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

// Validate Session
export async function validateSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}

// Delete Session
export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Get session from cookies
export function getSessionId(event: RequestEvent): string | null {
  return event.cookies.get('session') || null;
}

// Set session cookie
export function setSessionCookie(event: RequestEvent, sessionId: string) {
  event.cookies.set('session', sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
  });
}

// Clear session cookie
export function clearSessionCookie(event: RequestEvent) {
  event.cookies.delete('session', { path: '/' });
}
