/**
 * Persistent Rate Limiter
 *
 * SQLite-based rate limiting that persists across server restarts.
 * Falls back to in-memory when database is unavailable.
 */

import { db } from './db';
import { rateLimits } from './db/schema';
import { eq, and, lt } from 'drizzle-orm';

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory fallback store
const memoryStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000 // 15 minutes
};

const AUTH_CONFIG: RateLimitConfig = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000
};

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
	retryAfterSeconds?: number;
}

/**
 * Check rate limit using SQLite storage
 */
export async function checkRateLimitPersistent(
	identifier: string,
	action: string = 'default',
	config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitResult> {
	const key = `${action}:${identifier}`;
	const now = Date.now();

	try {
		// Try to get existing entry
		const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);

		if (existing.length === 0) {
			// Create new entry
			const resetTime = new Date(now + config.windowMs);
			await db.insert(rateLimits).values({
				key,
				count: 1,
				resetTime
			});
			return {
				allowed: true,
				remaining: config.maxAttempts - 1,
				resetAt: now + config.windowMs
			};
		}

		const entry = existing[0];
		const resetAt = entry.resetTime.getTime();

		// If expired, reset entry
		if (now > resetAt) {
			const newResetTime = new Date(now + config.windowMs);
			await db
				.update(rateLimits)
				.set({ count: 1, resetTime: newResetTime })
				.where(eq(rateLimits.id, entry.id));
			return {
				allowed: true,
				remaining: config.maxAttempts - 1,
				resetAt: now + config.windowMs
			};
		}

		// Check if limit exceeded
		if (entry.count >= config.maxAttempts) {
			const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
			return {
				allowed: false,
				remaining: 0,
				resetAt,
				retryAfterSeconds
			};
		}

		// Increment count
		await db
			.update(rateLimits)
			.set({ count: entry.count + 1 })
			.where(eq(rateLimits.id, entry.id));

		return {
			allowed: true,
			remaining: config.maxAttempts - entry.count - 1,
			resetAt
		};
	} catch (error) {
		// Fallback to in-memory on database error
		console.error('[RateLimit] Database error, using memory fallback:', error);
		return checkRateLimitMemory(key, config);
	}
}

/**
 * In-memory fallback
 */
function checkRateLimitMemory(key: string, config: RateLimitConfig): RateLimitResult {
	const now = Date.now();
	const entry = memoryStore.get(key);

	if (!entry || now > entry.resetAt) {
		memoryStore.set(key, {
			count: 1,
			resetAt: now + config.windowMs
		});
		return {
			allowed: true,
			remaining: config.maxAttempts - 1,
			resetAt: now + config.windowMs
		};
	}

	if (entry.count >= config.maxAttempts) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt,
			retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000)
		};
	}

	entry.count++;
	return {
		allowed: true,
		remaining: config.maxAttempts - entry.count,
		resetAt: entry.resetAt
	};
}

/**
 * Reset rate limit
 */
export async function resetRateLimitPersistent(
	identifier: string,
	action: string = 'default'
): Promise<void> {
	const key = `${action}:${identifier}`;
	try {
		await db.delete(rateLimits).where(eq(rateLimits.key, key));
	} catch (error) {
		console.error('[RateLimit] Failed to reset:', error);
	}
	memoryStore.delete(key);
}

/**
 * Cleanup expired entries (run periodically)
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
	const now = new Date();
	try {
		const result = await db.delete(rateLimits).where(lt(rateLimits.resetTime, now)).returning();
		return result.length;
	} catch (error) {
		console.error('[RateLimit] Cleanup failed:', error);
		return 0;
	}
}

// Pre-configured persistent rate limiters
export const persistentRateLimiter = {
	auth: {
		login: (ip: string) => checkRateLimitPersistent(ip, 'login', AUTH_CONFIG),
		register: (ip: string) => checkRateLimitPersistent(ip, 'register', AUTH_CONFIG),
		resetPin: (ip: string) => checkRateLimitPersistent(ip, 'reset-pin', AUTH_CONFIG),
		resetLogin: (ip: string) => resetRateLimitPersistent(ip, 'login')
	},
	api: {
		general: (ip: string) =>
			checkRateLimitPersistent(ip, 'api', { maxAttempts: 100, windowMs: 60 * 1000 })
	}
};

export default persistentRateLimiter;
