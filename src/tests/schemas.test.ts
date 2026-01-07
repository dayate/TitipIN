// Simple schema tests without SvelteKit dependencies
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Inline phone normalizer
function normalizePhoneNumber(phone: string): string {
	let cleaned = phone.replace(/\D/g, '');

	if (cleaned.startsWith('62')) {
		cleaned = '0' + cleaned.slice(2);
	} else if (!cleaned.startsWith('0')) {
		cleaned = '0' + cleaned;
	}

	return cleaned;
}

// Inline schemas for testing
const loginSchema = z.object({
	whatsapp: z
		.string()
		.min(1, 'Nomor WhatsApp wajib diisi')
		.regex(/^[0-9+\-\s]+$/, 'Format nomor tidak valid')
		.transform(normalizePhoneNumber)
		.refine((val) => val.length >= 10 && val.length <= 15, {
			message: 'Nomor WhatsApp tidak valid'
		}),
	pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN hanya boleh berisi angka')
});

const registerSchema = z
	.object({
		name: z
			.string()
			.min(1, 'Nama wajib diisi')
			.refine((val) => !/\d/.test(val), { message: 'Nama tidak boleh mengandung angka' }),
		whatsapp: z.string().min(1, 'Nomor WhatsApp wajib diisi').transform(normalizePhoneNumber),
		pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
		confirmPin: z.string().length(6, 'Konfirmasi PIN harus 6 digit'),
		role: z.enum(['owner', 'supplier'] as const, {
			message: 'Role harus dipilih'
		})
	})
	.refine((data) => data.pin === data.confirmPin, {
		message: 'PIN dan Konfirmasi PIN tidak sama',
		path: ['confirmPin']
	});

const createStoreSchema = z.object({
	name: z.string().min(3, 'Nama lapak minimal 3 karakter'),
	description: z.string().optional(),
	visibility: z.enum(['public', 'private'] as const).default('private')
});

const joinStoreSchema = z.object({
	code: z
		.string()
		.min(4, 'Kode minimal 4 karakter')
		.transform((val) => val.toUpperCase())
});

describe('Auth Schemas', () => {
	describe('normalizePhoneNumber', () => {
		it('should normalize phone starting with 08', () => {
			expect(normalizePhoneNumber('081234567890')).toBe('081234567890');
		});

		it('should normalize phone starting with 62', () => {
			expect(normalizePhoneNumber('6281234567890')).toBe('081234567890');
		});

		it('should normalize phone starting with +62', () => {
			expect(normalizePhoneNumber('+6281234567890')).toBe('081234567890');
		});

		it('should handle phone without prefix', () => {
			expect(normalizePhoneNumber('81234567890')).toBe('081234567890');
		});

		it('should remove non-digit characters', () => {
			expect(normalizePhoneNumber('0812-3456-7890')).toBe('081234567890');
		});
	});

	describe('loginSchema', () => {
		it('should validate correct login data', () => {
			const result = loginSchema.safeParse({
				whatsapp: '081234567890',
				pin: '123456'
			});
			expect(result.success).toBe(true);
		});

		it('should reject empty whatsapp', () => {
			const result = loginSchema.safeParse({
				whatsapp: '',
				pin: '123456'
			});
			expect(result.success).toBe(false);
		});

		it('should reject PIN not 6 digits', () => {
			const result = loginSchema.safeParse({
				whatsapp: '081234567890',
				pin: '1234'
			});
			expect(result.success).toBe(false);
		});

		it('should reject non-numeric PIN', () => {
			const result = loginSchema.safeParse({
				whatsapp: '081234567890',
				pin: '12345a'
			});
			expect(result.success).toBe(false);
		});

		it('should normalize phone in output', () => {
			const result = loginSchema.safeParse({
				whatsapp: '6281234567890',
				pin: '123456'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.whatsapp).toBe('081234567890');
			}
		});
	});

	describe('registerSchema', () => {
		it('should validate correct registration data', () => {
			const result = registerSchema.safeParse({
				name: 'John Doe',
				whatsapp: '081234567890',
				pin: '123456',
				confirmPin: '123456',
				role: 'supplier'
			});
			expect(result.success).toBe(true);
		});

		it('should reject name with numbers', () => {
			const result = registerSchema.safeParse({
				name: 'John123',
				whatsapp: '081234567890',
				pin: '123456',
				confirmPin: '123456',
				role: 'supplier'
			});
			expect(result.success).toBe(false);
		});

		it('should reject mismatched PIN', () => {
			const result = registerSchema.safeParse({
				name: 'John Doe',
				whatsapp: '081234567890',
				pin: '123456',
				confirmPin: '654321',
				role: 'supplier'
			});
			expect(result.success).toBe(false);
		});

		it('should reject invalid role', () => {
			const result = registerSchema.safeParse({
				name: 'John Doe',
				whatsapp: '081234567890',
				pin: '123456',
				confirmPin: '123456',
				role: 'admin'
			});
			expect(result.success).toBe(false);
		});
	});
});

describe('Store Schemas', () => {
	describe('createStoreSchema', () => {
		it('should validate correct store data', () => {
			const result = createStoreSchema.safeParse({
				name: 'Lapak Test',
				description: 'Deskripsi lapak',
				visibility: 'public'
			});
			expect(result.success).toBe(true);
		});

		it('should reject name too short', () => {
			const result = createStoreSchema.safeParse({
				name: 'AB',
				visibility: 'private'
			});
			expect(result.success).toBe(false);
		});

		it('should default visibility to private', () => {
			const result = createStoreSchema.safeParse({
				name: 'Lapak Test'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.visibility).toBe('private');
			}
		});
	});

	describe('joinStoreSchema', () => {
		it('should validate correct join code', () => {
			const result = joinStoreSchema.safeParse({
				code: 'ABCD12'
			});
			expect(result.success).toBe(true);
		});

		it('should uppercase the code', () => {
			const result = joinStoreSchema.safeParse({
				code: 'abcd12'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.code).toBe('ABCD12');
			}
		});

		it('should reject code too short', () => {
			const result = joinStoreSchema.safeParse({
				code: 'ABC'
			});
			expect(result.success).toBe(false);
		});
	});
});
