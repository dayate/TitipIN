/**
 * Environment Configuration
 *
 * Centralized configuration with Zod validation for type safety.
 * Validates all environment variables at startup (fail-fast).
 *
 * @module server/config
 */

import { z } from 'zod';

/**
 * Environment schema with validation rules
 */
const envSchema = z.object({
	// Database
	DATABASE_URL: z.string().default('file:./dev.db'),

	// Session
	SESSION_SECRET: z
		.string()
		.min(16, 'SESSION_SECRET must be at least 16 characters')
		.default('dev-secret-change-in-production'),
	SESSION_MAX_AGE: z.coerce
		.number()
		.positive()
		.default(60 * 60 * 24 * 30), // 30 days

	// Rate Limiting
	LOGIN_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
	LOGIN_WINDOW_MS: z.coerce
		.number()
		.positive()
		.default(15 * 60 * 1000), // 15 minutes

	// App
	APP_NAME: z.string().default('Mak Unyil'),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	// Feature Flags (boolean strings)
	ENABLE_WHATSAPP_NOTIFICATIONS: z
		.string()
		.default('false')
		.transform((v) => v === 'true' || v === '1'),
	ENABLED_FEATURES: z.string().optional(),
	DISABLED_FEATURES: z.string().optional()
});

/**
 * Validated environment variables
 * Throws at startup if validation fails
 */
function validateEnv() {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error('❌ Invalid environment configuration:');
		console.error(result.error.format());
		throw new Error('Invalid environment configuration. Check your .env file.');
	}

	return result.data;
}

const env = validateEnv();

/**
 * Application Configuration Interface
 */
export interface Config {
	// Database
	databaseUrl: string;

	// Session
	sessionSecret: string;
	sessionMaxAge: number; // in seconds

	// Rate Limiting
	loginMaxAttempts: number;
	loginWindowMs: number;

	// App
	appName: string;
	nodeEnv: 'development' | 'production' | 'test';
	isProduction: boolean;
	isDevelopment: boolean;
	isTest: boolean;

	// Feature Flags
	enableWhatsAppNotifications: boolean;
}

/**
 * Validated application configuration
 */
export const config: Config = {
	// Database
	databaseUrl: env.DATABASE_URL,

	// Session
	sessionSecret: env.SESSION_SECRET,
	sessionMaxAge: env.SESSION_MAX_AGE,

	// Rate Limiting
	loginMaxAttempts: env.LOGIN_MAX_ATTEMPTS,
	loginWindowMs: env.LOGIN_WINDOW_MS,

	// App
	appName: env.APP_NAME,
	nodeEnv: env.NODE_ENV,
	isProduction: env.NODE_ENV === 'production',
	isDevelopment: env.NODE_ENV === 'development',
	isTest: env.NODE_ENV === 'test',

	// Feature Flags
	enableWhatsAppNotifications: env.ENABLE_WHATSAPP_NOTIFICATIONS
};

/**
 * Verify configuration is valid
 * Call this at app startup for early failure
 */
export function verifyConfig(): void {
	// Session secret warning in production
	if (config.isProduction && config.sessionSecret === 'dev-secret-change-in-production') {
		console.warn('⚠️  WARNING: Using default session secret in production!');
	}

	// Database URL check
	if (config.isProduction && config.databaseUrl.startsWith('file:')) {
		console.warn('⚠️  WARNING: Using SQLite in production. Consider PostgreSQL.');
	}

	console.log(`✅ Configuration validated for ${config.nodeEnv} environment`);
}

export default config;
