/**
 * Zod Validation Schemas
 * Form validation for store-related operations
 */

import { z } from 'zod';

// Create Store Schema
export const createStoreSchema = z.object({
	name: z
		.string()
		.min(3, 'Nama lapak minimal 3 karakter')
		.max(50, 'Nama lapak maksimal 50 karakter'),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
	visibility: z.enum(['public', 'private']).default('private')
});

// Update Store Schema
export const updateStoreSchema = z.object({
	name: z
		.string()
		.min(3, 'Nama lapak minimal 3 karakter')
		.max(50, 'Nama lapak maksimal 50 karakter')
		.optional(),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').nullable().optional(),
	phone: z
		.string()
		.regex(/^(\+62|62|0)?8[1-9][0-9]{7,10}$/, 'Format nomor telepon tidak valid')
		.nullable()
		.optional(),
	address: z.string().max(200, 'Alamat maksimal 200 karakter').nullable().optional(),
	operatingDays: z.string().max(50, 'Hari operasional maksimal 50 karakter').nullable().optional(),
	openTime: z
		.string()
		.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam tidak valid (HH:MM)')
		.nullable()
		.optional(),
	closeTime: z
		.string()
		.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam tidak valid (HH:MM)')
		.nullable()
		.optional(),
	visibility: z.enum(['public', 'private']).optional(),
	isOpen: z.boolean().optional(),
	autoApprove: z.boolean().optional(),
	emergencyMode: z.boolean().optional(),
	announcement: z.string().max(500, 'Pengumuman maksimal 500 karakter').nullable().optional()
});

// Join Store Schema
export const joinStoreSchema = z.object({
	code: z
		.string()
		.min(6, 'Kode undangan minimal 6 karakter')
		.max(20, 'Kode undangan maksimal 20 karakter')
		.transform((val: string) => val.toUpperCase())
});

// Leave Store Schema
export const leaveStoreSchema = z.object({
	memberId: z.number().positive('Member ID tidak valid'),
	reason: z.string().min(5, 'Alasan minimal 5 karakter').max(500, 'Alasan maksimal 500 karakter')
});

// Type exports
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type JoinStoreInput = z.infer<typeof joinStoreSchema>;
export type LeaveStoreInput = z.infer<typeof leaveStoreSchema>;
