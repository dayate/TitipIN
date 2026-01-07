import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { createIndexes } from './indexes';

const sqlite = new Database('./data/database.db');
export const db = drizzle(sqlite, { schema });

// Initialize database indexes for performance optimization
// This creates all 28 indexes if they don't exist
try {
	createIndexes(db as unknown as Parameters<typeof createIndexes>[0]);
	console.log('[DB] Database indexes initialized successfully');
} catch (error) {
	console.error('[DB] Failed to create indexes:', error);
}

// Export schema for convenience
export * from './schema';
