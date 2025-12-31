import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./data/database.db');
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from './schema';
