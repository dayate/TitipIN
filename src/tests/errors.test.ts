/**
 * Error Handling Tests
 *
 * Tests for custom error classes and error handling utilities.
 */

import { describe, it, expect } from 'vitest';
import {
	AppError,
	NotFoundError,
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	RateLimitError,
	ConflictError,
	DatabaseError,
	BusinessLogicError,
	isAppError,
	handleError,
	formatErrorResponse,
	formatSuccessResponse
} from '$lib/server/errors';

describe('Custom Error Classes', () => {
	describe('AppError', () => {
		it('should create base error with default values', () => {
			const error = new AppError('Test error');

			expect(error.message).toBe('Test error');
			expect(error.statusCode).toBe(500);
			expect(error.code).toBe('INTERNAL_ERROR');
			expect(error.isOperational).toBe(true);
		});

		it('should accept custom status code and code', () => {
			const error = new AppError('Custom error', 418, 'TEAPOT');

			expect(error.statusCode).toBe(418);
			expect(error.code).toBe('TEAPOT');
		});

		it('should be instance of Error', () => {
			const error = new AppError('Test');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
		});
	});

	describe('NotFoundError', () => {
		it('should have 404 status code', () => {
			const error = new NotFoundError('User');

			expect(error.statusCode).toBe(404);
			expect(error.code).toBe('NOT_FOUND');
			expect(error.message).toBe('User tidak ditemukan');
		});

		it('should use default resource name', () => {
			const error = new NotFoundError();

			expect(error.message).toBe('Resource tidak ditemukan');
		});
	});

	describe('ValidationError', () => {
		it('should have 400 status code', () => {
			const error = new ValidationError();

			expect(error.statusCode).toBe(400);
			expect(error.code).toBe('VALIDATION_ERROR');
		});

		it('should store field errors', () => {
			const errors = { name: 'Wajib diisi', email: 'Format tidak valid' };
			const error = new ValidationError('Validasi gagal', errors);

			expect(error.errors).toEqual(errors);
			expect(error.errors.name).toBe('Wajib diisi');
		});
	});

	describe('AuthenticationError', () => {
		it('should have 401 status code', () => {
			const error = new AuthenticationError();

			expect(error.statusCode).toBe(401);
			expect(error.code).toBe('AUTHENTICATION_ERROR');
		});

		it('should accept custom message', () => {
			const error = new AuthenticationError('Session expired');

			expect(error.message).toBe('Session expired');
		});
	});

	describe('AuthorizationError', () => {
		it('should have 403 status code', () => {
			const error = new AuthorizationError();

			expect(error.statusCode).toBe(403);
			expect(error.code).toBe('AUTHORIZATION_ERROR');
		});
	});

	describe('RateLimitError', () => {
		it('should have 429 status code', () => {
			const error = new RateLimitError();

			expect(error.statusCode).toBe(429);
			expect(error.code).toBe('RATE_LIMIT_ERROR');
		});

		it('should store retryAfter value', () => {
			const error = new RateLimitError(120);

			expect(error.retryAfter).toBe(120);
			expect(error.message).toContain('120');
		});

		it('should default to 60 seconds', () => {
			const error = new RateLimitError();

			expect(error.retryAfter).toBe(60);
		});
	});

	describe('ConflictError', () => {
		it('should have 409 status code', () => {
			const error = new ConflictError();

			expect(error.statusCode).toBe(409);
			expect(error.code).toBe('CONFLICT_ERROR');
		});
	});

	describe('DatabaseError', () => {
		it('should have 500 status code', () => {
			const error = new DatabaseError();

			expect(error.statusCode).toBe(500);
			expect(error.code).toBe('DATABASE_ERROR');
		});

		it('should store original error', () => {
			const original = new Error('SQL syntax error');
			const error = new DatabaseError('Query failed', original);

			expect(error.originalError).toBe(original);
		});
	});

	describe('BusinessLogicError', () => {
		it('should have 422 status code', () => {
			const error = new BusinessLogicError('Cannot cancel completed transaction');

			expect(error.statusCode).toBe(422);
			expect(error.code).toBe('BUSINESS_LOGIC_ERROR');
		});
	});
});

describe('Error Utilities', () => {
	describe('isAppError', () => {
		it('should return true for AppError instances', () => {
			expect(isAppError(new AppError('test'))).toBe(true);
			expect(isAppError(new NotFoundError())).toBe(true);
			expect(isAppError(new ValidationError())).toBe(true);
		});

		it('should return false for non-AppError', () => {
			expect(isAppError(new Error('test'))).toBe(false);
			expect(isAppError('string error')).toBe(false);
			expect(isAppError(null)).toBe(false);
			expect(isAppError(undefined)).toBe(false);
		});
	});

	describe('handleError', () => {
		it('should return AppError as-is', () => {
			const original = new NotFoundError('User');
			const result = handleError(original);

			expect(result).toBe(original);
		});

		it('should wrap regular Error in AppError', () => {
			const regular = new Error('Something went wrong');
			const result = handleError(regular);

			expect(result).toBeInstanceOf(AppError);
			expect(result.message).toBe('Something went wrong');
		});

		it('should handle unknown errors', () => {
			const result = handleError('just a string');

			expect(result).toBeInstanceOf(AppError);
			expect(result.code).toBe('UNKNOWN_ERROR');
		});

		it('should include context in logging', () => {
			const error = new ValidationError('Test');
			const result = handleError(error, 'TestContext');

			expect(result).toBe(error);
		});
	});

	describe('formatErrorResponse', () => {
		it('should format error for API response', () => {
			const error = new NotFoundError('Product');
			const response = formatErrorResponse(error);

			expect(response.success).toBe(false);
			expect(response.error.message).toBe('Product tidak ditemukan');
			expect(response.error.code).toBe('NOT_FOUND');
		});

		it('should include validation errors', () => {
			const error = new ValidationError('Invalid', { email: 'Required' });
			const response = formatErrorResponse(error);

			expect(response.error.errors).toEqual({ email: 'Required' });
		});
	});

	describe('formatSuccessResponse', () => {
		it('should format success response with data', () => {
			const data = { id: 1, name: 'Test' };
			const response = formatSuccessResponse(data);

			expect(response.success).toBe(true);
			expect(response.data).toEqual(data);
		});

		it('should include optional message', () => {
			const response = formatSuccessResponse(null, 'Operation successful');

			expect(response.success).toBe(true);
			expect(response.message).toBe('Operation successful');
		});

		it('should handle no data', () => {
			const response = formatSuccessResponse();

			expect(response.success).toBe(true);
			expect(response.data).toBeUndefined();
		});
	});
});
