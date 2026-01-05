/**
 * In-Memory Cache System with TTL
 *
 * Provides a simple but effective caching layer for frequently accessed data.
 * Uses stale-while-revalidate pattern for optimal performance.
 *
 * @module server/cache
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

/**
 * Simple in-memory cache with TTL support
 */
class Cache {
	private store = new Map<string, CacheEntry<unknown>>();
	private readonly maxSize: number;
	private readonly defaultTTL: number;

	constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
		this.maxSize = options.maxSize ?? 1000;
		this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes default
	}

	/**
	 * Get a value from the cache
	 * @param key - Cache key
	 * @returns Cached value or undefined if not found/expired
	 */
	get<T>(key: string): T | undefined {
		const entry = this.store.get(key) as CacheEntry<T> | undefined;

		if (!entry) return undefined;

		const now = Date.now();
		if (now - entry.timestamp > entry.ttl) {
			this.store.delete(key);
			return undefined;
		}

		return entry.data;
	}

	/**
	 * Set a value in the cache
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param ttl - Time to live in milliseconds (optional)
	 */
	set<T>(key: string, value: T, ttl?: number): void {
		// Evict oldest entries if cache is full
		if (this.store.size >= this.maxSize) {
			this.evictOldest();
		}

		this.store.set(key, {
			data: value,
			timestamp: Date.now(),
			ttl: ttl ?? this.defaultTTL
		});
	}

	/**
	 * Delete a value from the cache
	 * @param key - Cache key
	 */
	delete(key: string): boolean {
		return this.store.delete(key);
	}

	/**
	 * Delete all entries matching a pattern
	 * @param pattern - Pattern to match (uses startsWith)
	 */
	deletePattern(pattern: string): number {
		let deleted = 0;
		for (const key of this.store.keys()) {
			if (key.startsWith(pattern)) {
				this.store.delete(key);
				deleted++;
			}
		}
		return deleted;
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.store.clear();
	}

	/**
	 * Get cache statistics
	 */
	stats(): { size: number; maxSize: number } {
		return {
			size: this.store.size,
			maxSize: this.maxSize
		};
	}

	/**
	 * Stale-while-revalidate pattern
	 * Returns stale data immediately while refreshing in background
	 *
	 * @param key - Cache key
	 * @param fetcher - Function to fetch fresh data
	 * @param ttl - Time to live in milliseconds
	 * @param staleTTL - Time after which data is considered stale (but still usable)
	 */
	async getOrSet<T>(
		key: string,
		fetcher: () => Promise<T>,
		ttl?: number,
		staleTTL?: number
	): Promise<T> {
		const entry = this.store.get(key) as CacheEntry<T> | undefined;
		const now = Date.now();

		// No entry - fetch and cache
		if (!entry) {
			const data = await fetcher();
			this.set(key, data, ttl);
			return data;
		}

		const age = now - entry.timestamp;
		const effectiveTTL = entry.ttl;
		const effectiveStaleTTL = staleTTL ?? effectiveTTL * 2;

		// Fresh data - return immediately
		if (age < effectiveTTL) {
			return entry.data;
		}

		// Stale but usable - return and refresh in background
		if (age < effectiveStaleTTL) {
			// Background refresh (fire and forget)
			fetcher().then(data => {
				this.set(key, data, ttl);
			}).catch(() => {
				// Ignore errors in background refresh
			});
			return entry.data;
		}

		// Too stale - must refresh
		const data = await fetcher();
		this.set(key, data, ttl);
		return data;
	}

	/**
	 * Evict the oldest entry
	 */
	private evictOldest(): void {
		let oldestKey: string | null = null;
		let oldestTime = Infinity;

		for (const [key, entry] of this.store.entries()) {
			if (entry.timestamp < oldestTime) {
				oldestTime = entry.timestamp;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.store.delete(oldestKey);
		}
	}
}

// Singleton instances for different cache domains
export const storeCache = new Cache({ maxSize: 100, defaultTTL: 5 * 60 * 1000 }); // 5 min
export const productCache = new Cache({ maxSize: 500, defaultTTL: 2 * 60 * 1000 }); // 2 min
export const transactionCache = new Cache({ maxSize: 200, defaultTTL: 1 * 60 * 1000 }); // 1 min
export const analyticsCache = new Cache({ maxSize: 50, defaultTTL: 10 * 60 * 1000 }); // 10 min
export const userCache = new Cache({ maxSize: 200, defaultTTL: 5 * 60 * 1000 }); // 5 min

/**
 * Cache key generators for consistency
 */
export const cacheKeys = {
	store: (id: number) => `store:${id}`,
	storeProducts: (storeId: number, supplierId?: number) =>
		supplierId ? `products:${storeId}:${supplierId}` : `products:${storeId}`,
	storeMembers: (storeId: number) => `members:${storeId}`,
	userStores: (userId: number) => `user_stores:${userId}`,
	transaction: (id: number) => `trx:${id}`,
	transactionItems: (trxId: number) => `trx_items:${trxId}`,
	dailyTransactions: (storeId: number, date: string) => `daily_trx:${storeId}:${date}`,
	analytics: (storeId: number, period: string) => `analytics:${storeId}:${period}`,
	supplierStats: (supplierId: number, storeId: number) => `stats:${supplierId}:${storeId}`,
	user: (id: number) => `user:${id}`,
	notifications: (userId: number) => `notif:${userId}`,
	unreadCount: (userId: number) => `unread:${userId}`
};

/**
 * Invalidate all caches related to a store
 * Call this when store data changes
 */
export function invalidateStoreCache(storeId: number): void {
	storeCache.delete(cacheKeys.store(storeId));
	storeCache.deletePattern(`products:${storeId}`);
	storeCache.deletePattern(`members:${storeId}`);
	transactionCache.deletePattern(`daily_trx:${storeId}`);
	analyticsCache.deletePattern(`analytics:${storeId}`);
}

/**
 * Invalidate all caches related to a user
 * Call this when user data changes
 */
export function invalidateUserCache(userId: number): void {
	userCache.delete(cacheKeys.user(userId));
	userCache.delete(cacheKeys.userStores(userId));
	userCache.delete(cacheKeys.notifications(userId));
	userCache.delete(cacheKeys.unreadCount(userId));
}

/**
 * Invalidate transaction cache
 * Call this when transactions are created/updated
 */
export function invalidateTransactionCache(storeId: number, date?: string): void {
	if (date) {
		transactionCache.delete(cacheKeys.dailyTransactions(storeId, date));
	} else {
		transactionCache.deletePattern(`daily_trx:${storeId}`);
	}
	analyticsCache.deletePattern(`analytics:${storeId}`);
}

// Export Cache class for custom instances
export { Cache };
