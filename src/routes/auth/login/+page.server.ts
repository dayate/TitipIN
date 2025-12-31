import type { Actions } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { authenticateUser } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const whatsapp = data.get('whatsapp')?.toString().trim();
		const pin = data.get('pin')?.toString();
		const redirectTo = data.get('redirect')?.toString();

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

		try {
			const result = await authenticateUser(normalizedWhatsapp, pin);

			if (!result) {
				return fail(400, { error: 'Nomor WhatsApp atau PIN salah' });
			}

			const { user, sessionId } = result;

			// Set session cookie
			cookies.set('session_id', sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});

			// Redirect
			if (redirectTo && redirectTo.startsWith('/')) {
				redirect(302, redirectTo);
			}

			redirect(302, user.role === 'owner' ? '/admin' : '/app');
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error('Login error:', err);
			return fail(500, { error: 'Terjadi kesalahan, silakan coba lagi' });
		}
	}
};
