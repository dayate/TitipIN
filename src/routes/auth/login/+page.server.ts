import type { Actions, RequestEvent } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { authenticateUser } from '$lib/server/auth';
import { rateLimiter } from '$lib/server/rateLimit';
import { loginSchema, validateForm } from '$lib/schemas';
import { logger } from '$lib/server/logger';

function getClientIP(event: RequestEvent): string {
	return event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
		|| event.request.headers.get('x-real-ip')
		|| 'unknown';
}

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;
		const ip = getClientIP(event);

		// Check rate limit
		const rateCheck = rateLimiter.auth.login(ip);
		if (!rateCheck.allowed) {
			logger.warn('Rate limit exceeded for login', { ip });
			return fail(429, {
				error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateCheck.retryAfterSeconds} detik.`
			});
		}

		const formData = await request.formData();
		const data = {
			whatsapp: formData.get('whatsapp')?.toString().trim() || '',
			pin: formData.get('pin')?.toString() || ''
		};
		const redirectTo = formData.get('redirect')?.toString();

		// Validate with Zod
		const validation = validateForm(loginSchema, data);
		if (!validation.success) {
			const firstError = Object.values(validation.errors)[0];
			return fail(400, { error: firstError });
		}

		const { whatsapp, pin } = validation.data;

		// Use normalized whatsapp from schema (already normalized to 08xxx format)
		const normalizedWhatsapp = whatsapp;

		try {
			const result = await authenticateUser(normalizedWhatsapp, pin);

			if (!result) {
				logger.auth.login(normalizedWhatsapp, false);
				return fail(400, { error: 'Nomor WhatsApp atau PIN salah' });
			}

			const { user, sessionId } = result;

			// Reset rate limit on successful login
			rateLimiter.auth.resetLogin(ip);
			logger.auth.login(normalizedWhatsapp, true);

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
			logger.error('Login error', err);
			return fail(500, { error: 'Terjadi kesalahan, silakan coba lagi' });
		}
	}
};
