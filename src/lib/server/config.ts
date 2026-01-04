/**
 * Environment Configuration
 * Centralized config with defaults and validation
 */

interface Config {
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

	// Feature Flags
	enableWhatsAppNotifications: boolean;
}

function getEnv(key: string, defaultValue?: string): string {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
	const value = process.env[key];
	if (value === undefined) return defaultValue;
	const parsed = parseInt(value, 10);
	if (isNaN(parsed)) {
		throw new Error(`Environment variable ${key} must be a number`);
	}
	return parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
	const value = process.env[key];
	if (value === undefined) return defaultValue;
	return value.toLowerCase() === 'true' || value === '1';
}

export const config: Config = {
	// Database
	databaseUrl: getEnv('DATABASE_URL', 'file:./dev.db'),

	// Session
	sessionSecret: getEnv('SESSION_SECRET', 'dev-secret-change-in-production'),
	sessionMaxAge: getEnvNumber('SESSION_MAX_AGE', 60 * 60 * 24 * 30), // 30 days

	// Rate Limiting
	loginMaxAttempts: getEnvNumber('LOGIN_MAX_ATTEMPTS', 5),
	loginWindowMs: getEnvNumber('LOGIN_WINDOW_MS', 15 * 60 * 1000), // 15 minutes

	// App
	appName: getEnv('APP_NAME', 'Mak Unyil'),
	nodeEnv: (getEnv('NODE_ENV', 'development') as Config['nodeEnv']),
	isProduction: getEnv('NODE_ENV', 'development') === 'production',

	// Feature Flags
	enableWhatsAppNotifications: getEnvBoolean('ENABLE_WHATSAPP_NOTIFICATIONS', false)
};

export default config;
