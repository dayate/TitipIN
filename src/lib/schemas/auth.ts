/**
 * Zod Validation Schemas
 * Form validation for authentication
 */

import { z } from 'zod';

// Indonesian phone number regex (with or without country code)
const phoneRegex = /^(\+62|62|0)?8[1-9][0-9]{7,10}$/;

// Normalize phone number to format without country code prefix
export function normalizePhoneNumber(phone: string): string {
	// Remove all non-digits
	let cleaned = phone.replace(/\D/g, '');

	// Remove country code prefix
	if (cleaned.startsWith('62')) {
		cleaned = '0' + cleaned.slice(2);
	} else if (!cleaned.startsWith('0')) {
		cleaned = '0' + cleaned;
	}

	return cleaned;
}

// Login Schema
export const loginSchema = z.object({
	whatsapp: z
		.string()
		.min(1, 'Nomor WhatsApp wajib diisi')
		.regex(phoneRegex, 'Format nomor WhatsApp tidak valid')
		.transform(normalizePhoneNumber),
	pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN hanya boleh berisi angka')
});

// Register Schema
export const registerSchema = z
	.object({
		name: z
			.string()
			.min(2, 'Nama minimal 2 karakter')
			.max(50, 'Nama maksimal 50 karakter')
			.regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh berisi huruf'),
		whatsapp: z
			.string()
			.min(1, 'Nomor WhatsApp wajib diisi')
			.regex(phoneRegex, 'Format nomor WhatsApp tidak valid')
			.transform(normalizePhoneNumber),
		pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
		confirmPin: z.string().length(6, 'Konfirmasi PIN harus 6 digit'),
		role: z.enum(['owner', 'supplier'] as const, {
			message: 'Role harus dipilih'
		})
	})
	.refine((data: { pin: string; confirmPin: string }) => data.pin === data.confirmPin, {
		message: 'PIN dan Konfirmasi PIN tidak sama',
		path: ['confirmPin']
	});

// Reset PIN Schema
export const resetPinSchema = z
	.object({
		whatsapp: z
			.string()
			.min(1, 'Nomor WhatsApp wajib diisi')
			.regex(phoneRegex, 'Format nomor WhatsApp tidak valid')
			.transform(normalizePhoneNumber),
		newPin: z
			.string()
			.length(6, 'PIN harus 6 digit')
			.regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
		confirmPin: z.string().length(6, 'Konfirmasi PIN harus 6 digit')
	})
	.refine((data: { newPin: string; confirmPin: string }) => data.newPin === data.confirmPin, {
		message: 'PIN dan Konfirmasi PIN tidak sama',
		path: ['confirmPin']
	});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPinInput = z.infer<typeof resetPinSchema>;

// Validation helper with proper typing
export function validateForm<T extends z.ZodTypeAny>(
	schema: T,
	data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
	const result = schema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	// Zod v4 uses 'issues', v3 uses 'errors' - handle both
	const issues = (result.error as any).issues || (result.error as any).errors || [];
	for (const issue of issues) {
		const path = issue.path.join('.');
		if (!errors[path]) {
			errors[path] = issue.message;
		}
	}

	return { success: false, errors };
}
