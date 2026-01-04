/**
 * Custom Error Classes
 * Provides consistent error handling across the application
 */

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string = 'Resource') {
		super(`${resource} tidak ditemukan`, 404, 'NOT_FOUND');
	}
}

export class ValidationError extends AppError {
	public readonly errors: Record<string, string>;

	constructor(message: string = 'Validasi gagal', errors: Record<string, string> = {}) {
		super(message, 400, 'VALIDATION_ERROR');
		this.errors = errors;
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string = 'Autentikasi diperlukan') {
		super(message, 401, 'AUTHENTICATION_ERROR');
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string = 'Tidak memiliki akses') {
		super(message, 403, 'AUTHORIZATION_ERROR');
	}
}

export class RateLimitError extends AppError {
	public readonly retryAfter: number;

	constructor(retryAfter: number = 60) {
		super(`Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik`, 429, 'RATE_LIMIT_ERROR');
		this.retryAfter = retryAfter;
	}
}

export class ConflictError extends AppError {
	constructor(message: string = 'Data sudah ada') {
		super(message, 409, 'CONFLICT_ERROR');
	}
}

// Error response helper
export interface ErrorResponse {
	success: false;
	error: {
		message: string;
		code: string;
		errors?: Record<string, string>;
	};
}

export function formatErrorResponse(error: AppError): ErrorResponse {
	return {
		success: false,
		error: {
			message: error.message,
			code: error.code,
			...(error instanceof ValidationError && { errors: error.errors })
		}
	};
}

// Success response helper
export interface SuccessResponse<T = unknown> {
	success: true;
	data?: T;
	message?: string;
}

export function formatSuccessResponse<T>(data?: T, message?: string): SuccessResponse<T> {
	return {
		success: true,
		...(data !== undefined && { data }),
		...(message && { message })
	};
}
