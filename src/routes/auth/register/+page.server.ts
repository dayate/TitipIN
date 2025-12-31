import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createUser, getUserByWhatsapp } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const whatsapp = data.get('whatsapp')?.toString().trim();
		const pin = data.get('pin')?.toString();
		const confirmPin = data.get('confirmPin')?.toString();
		const role = data.get('role')?.toString() as 'owner' | 'supplier';

		// Strict Validation - Name
		if (!name || name.length < 3) {
			return fail(400, { error: 'Nama minimal 3 karakter' });
		}
		if (name.length > 50) {
			return fail(400, { error: 'Nama maksimal 50 karakter' });
		}
		if (!/^[a-zA-Z\s]+$/.test(name)) {
			return fail(400, { error: 'Nama hanya boleh huruf dan spasi' });
		}

		// Strict Validation - WhatsApp
		if (!whatsapp) {
			return fail(400, { error: 'Nomor WhatsApp wajib diisi' });
		}

		let normalizedWhatsapp = whatsapp.replace(/\D/g, '');

		if (normalizedWhatsapp.length < 10) {
			return fail(400, { error: 'Nomor WhatsApp minimal 10 digit' });
		}
		if (normalizedWhatsapp.length > 15) {
			return fail(400, { error: 'Nomor WhatsApp maksimal 15 digit' });
		}
		if (!normalizedWhatsapp.startsWith('08') && !normalizedWhatsapp.startsWith('62')) {
			return fail(400, { error: 'Nomor WhatsApp harus diawali 08 atau 62' });
		}

		// Normalize to 62 format
		if (normalizedWhatsapp.startsWith('0')) {
			normalizedWhatsapp = '62' + normalizedWhatsapp.slice(1);
		}

		// Strict Validation - PIN
		if (!pin) {
			return fail(400, { error: 'PIN wajib diisi' });
		}
		if (!/^\d+$/.test(pin)) {
			return fail(400, { error: 'PIN hanya boleh angka' });
		}
		if (pin.length !== 6) {
			return fail(400, { error: 'PIN harus tepat 6 digit' });
		}

		// Confirm PIN
		if (pin !== confirmPin) {
			return fail(400, { error: 'PIN tidak cocok' });
		}

		// Role validation
		if (!role || !['owner', 'supplier'].includes(role)) {
			return fail(400, { error: 'Pilih tipe akun' });
		}

		// Check if user already exists
		const existingUser = await getUserByWhatsapp(normalizedWhatsapp);
		if (existingUser) {
			return fail(400, { error: 'Nomor WhatsApp sudah terdaftar' });
		}

		try {
			// Create user (without creating session)
			await createUser({
				name,
				whatsapp: normalizedWhatsapp,
				pin,
				role
			});

			// Return success - user will be shown success message and redirected to login
			return { success: true };
		} catch (err) {
			console.error('Registration error:', err);
			return fail(500, { error: 'Terjadi kesalahan, silakan coba lagi' });
		}
	}
};
