import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getUserByWhatsapp, updateUserPin, invalidateAllUserSessions } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const whatsapp = data.get('whatsapp')?.toString().trim();
		const newPin = data.get('newPin')?.toString();
		const confirmPin = data.get('confirmPin')?.toString();

		// Validation
		if (!whatsapp || whatsapp.length < 10) {
			return fail(400, { error: 'Nomor WhatsApp tidak valid' });
		}

		if (!newPin || newPin.length < 6) {
			return fail(400, { error: 'PIN baru minimal 6 digit' });
		}

		if (newPin !== confirmPin) {
			return fail(400, { error: 'PIN tidak cocok' });
		}

		// Normalize WhatsApp number
		let normalizedWhatsapp = whatsapp.replace(/\D/g, '');
		if (normalizedWhatsapp.startsWith('0')) {
			normalizedWhatsapp = '62' + normalizedWhatsapp.slice(1);
		}

		try {
			// Check if user exists
			const user = await getUserByWhatsapp(normalizedWhatsapp);
			if (!user) {
				return fail(400, { error: 'Nomor WhatsApp tidak terdaftar' });
			}

			// Update PIN
			await updateUserPin(user.id, newPin);

			// Invalidate all existing sessions
			await invalidateAllUserSessions(user.id);

			return { success: true };
		} catch (err) {
			console.error('Reset PIN error:', err);
			return fail(500, { error: 'Terjadi kesalahan, silakan coba lagi' });
		}
	}
};
