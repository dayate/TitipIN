/**
 * Rate Limiter
 * Simple in-memory rate limiting for login/auth endpoints
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store (works for single instance, use Redis for production scaling)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number; // Time window in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000 // 15 minutes
};

const AUTH_CONFIG: RateLimitConfig = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000 // 15 minutes
};

function getKey(identifier: string, action: string): string {
	return `${action}:${identifier}`;
}

function cleanupExpired(): void {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (now > entry.resetAt) {
			rateLimitStore.delete(key);
		}
	}
}

// Run cleanup every 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
	retryAfterSeconds?: number;
}

export function checkRateLimit(
	identifier: string,
	action: string = 'default',
	config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
	const key = getKey(identifier, action);
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	// If no entry or expired, create new one
	if (!entry || now > entry.resetAt) {
		rateLimitStore.set(key, {
			count: 1,
			resetAt: now + config.windowMs
		});
		return {
			allowed: true,
			remaining: config.maxAttempts - 1,
			resetAt: now + config.windowMs
		};
	}

	// Check if limit exceeded
	if (entry.count >= config.maxAttempts) {
		const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt,
			retryAfterSeconds
		};
	}

	// Increment count
	entry.count++;
	rateLimitStore.set(key, entry);

	return {
		allowed: true,
		remaining: config.maxAttempts - entry.count,
		resetAt: entry.resetAt
	};
}

export function resetRateLimit(identifier: string, action: string = 'default'): void {
	const key = getKey(identifier, action);
	rateLimitStore.delete(key);
}

// Pre-configured rate limiters
export const rateLimiter = {
	auth: {
		login: (ip: string) => checkRateLimit(ip, 'login', AUTH_CONFIG),
		register: (ip: string) => checkRateLimit(ip, 'register', AUTH_CONFIG),
		resetPin: (ip: string) => checkRateLimit(ip, 'reset-pin', AUTH_CONFIG),

		// Reset on successful login
		resetLogin: (ip: string) => resetRateLimit(ip, 'login')
	},

	api: {
		general: (ip: string) => checkRateLimit(ip, 'api', { maxAttempts: 100, windowMs: 60 * 1000 })
	}
};

export default rateLimiter;
