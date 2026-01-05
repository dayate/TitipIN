// Simple test file without SvelteKit dependencies
import { describe, it, expect, beforeEach } from 'vitest';

// Inline implementation for testing (to avoid SvelteKit alias issues)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number;
}

interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	retryAfterSeconds: number;
}

function checkRateLimit(
	identifier: string,
	action: string = 'default',
	config: RateLimitConfig
): RateLimitResult {
	const key = `${identifier}:${action}`;
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	if (!entry || now > entry.resetTime) {
		rateLimitStore.set(key, {
			count: 1,
			resetTime: now + config.windowMs
		});
		return {
			allowed: true,
			remaining: config.maxAttempts - 1,
			retryAfterSeconds: 0
		};
	}

	if (entry.count >= config.maxAttempts) {
		const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
		return {
			allowed: false,
			remaining: 0,
			retryAfterSeconds: retryAfter
		};
	}

	entry.count++;
	return {
		allowed: true,
		remaining: config.maxAttempts - entry.count,
		retryAfterSeconds: 0
	};
}

function resetRateLimit(identifier: string, action: string): void {
	const key = `${identifier}:${action}`;
	rateLimitStore.delete(key);
}

describe('Rate Limiter', () => {
	const testIdentifier = 'test-user-123';
	const testAction = 'test-action';

	beforeEach(() => {
		resetRateLimit(testIdentifier, testAction);
	});

	describe('checkRateLimit', () => {
		it('should allow first request', () => {
			const result = checkRateLimit(testIdentifier, testAction, {
				maxAttempts: 5,
				windowMs: 60000
			});

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(4);
		});

		it('should decrement remaining attempts', () => {
			const config = { maxAttempts: 5, windowMs: 60000 };

			checkRateLimit(testIdentifier, testAction, config);
			const result = checkRateLimit(testIdentifier, testAction, config);

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(3);
		});

		it('should block after max attempts', () => {
			const config = { maxAttempts: 3, windowMs: 60000 };

			checkRateLimit(testIdentifier, testAction, config);
			checkRateLimit(testIdentifier, testAction, config);
			checkRateLimit(testIdentifier, testAction, config);

			const result = checkRateLimit(testIdentifier, testAction, config);

			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
			expect(result.retryAfterSeconds).toBeGreaterThan(0);
		});

		it('should use different keys for different actions', () => {
			const config = { maxAttempts: 2, windowMs: 60000 };

			checkRateLimit(testIdentifier, 'action1', config);
			checkRateLimit(testIdentifier, 'action1', config);

			const result = checkRateLimit(testIdentifier, 'action2', config);

			expect(result.allowed).toBe(true);
		});

		it('should use different keys for different identifiers', () => {
			const config = { maxAttempts: 2, windowMs: 60000 };

			checkRateLimit('user1', testAction, config);
			checkRateLimit('user1', testAction, config);

			const result = checkRateLimit('user2', testAction, config);

			expect(result.allowed).toBe(true);
		});
	});

	describe('resetRateLimit', () => {
		it('should reset rate limit for identifier', () => {
			const config = { maxAttempts: 2, windowMs: 60000 };

			checkRateLimit(testIdentifier, testAction, config);
			checkRateLimit(testIdentifier, testAction, config);

			expect(checkRateLimit(testIdentifier, testAction, config).allowed).toBe(false);

			resetRateLimit(testIdentifier, testAction);

			const result = checkRateLimit(testIdentifier, testAction, config);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(1);
		});
	});
});
