/**
 * Simple Logger Utility
 * Provides consistent logging format across the application
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
	level: LogLevel;
	message: string;
	data?: unknown;
	timestamp: string;
}

function formatLog(entry: LogEntry): string {
	const base = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
	return entry.data ? `${base} ${JSON.stringify(entry.data)}` : base;
}

function createEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
	return {
		level,
		message,
		data,
		timestamp: new Date().toISOString()
	};
}

export const logger = {
	debug: (message: string, data?: unknown) => {
		if (process.env.NODE_ENV === 'development') {
			console.debug(formatLog(createEntry('DEBUG', message, data)));
		}
	},

	info: (message: string, data?: unknown) => {
		console.log(formatLog(createEntry('INFO', message, data)));
	},

	warn: (message: string, data?: unknown) => {
		console.warn(formatLog(createEntry('WARN', message, data)));
	},

	error: (message: string, data?: unknown) => {
		console.error(formatLog(createEntry('ERROR', message, data)));
	},

	// Specialized loggers for common operations
	auth: {
		login: (whatsapp: string, success: boolean) => {
			logger.info(`Login attempt: ${success ? 'SUCCESS' : 'FAILED'}`, {
				whatsapp: whatsapp.slice(-4)
			});
		},
		register: (whatsapp: string) => {
			logger.info('New user registered', { whatsapp: whatsapp.slice(-4) });
		},
		logout: (userId: number) => {
			logger.info('User logged out', { userId });
		}
	},

	store: {
		created: (storeId: number, ownerId: number) => {
			logger.info('Store created', { storeId, ownerId });
		},
		deleted: (storeId: number) => {
			logger.info('Store deleted', { storeId });
		}
	},

	member: {
		joined: (userId: number, storeId: number) => {
			logger.info('Member join request', { userId, storeId });
		},
		approved: (memberId: number, storeId: number) => {
			logger.info('Member approved', { memberId, storeId });
		},
		rejected: (memberId: number, storeId: number) => {
			logger.info('Member rejected', { memberId, storeId });
		}
	},

	transaction: {
		created: (transactionId: number, supplierId: number) => {
			logger.info('Transaction created', { transactionId, supplierId });
		},
		completed: (transactionId: number, total: number) => {
			logger.info('Transaction completed', { transactionId, total });
		}
	}
};

export default logger;
