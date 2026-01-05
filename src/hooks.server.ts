import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { isStoreAdmin } from '$lib/server/members';
import { isStoreOwner } from '$lib/server/stores';

/**
 * Security Headers Configuration
 * OWASP recommended security headers for production
 */
const securityHeaders = {
	// Prevent clickjacking attacks
	'X-Frame-Options': 'DENY',
	// Prevent MIME type sniffing
	'X-Content-Type-Options': 'nosniff',
	// Enable XSS filter in older browsers
	'X-XSS-Protection': '1; mode=block',
	// Control referrer information
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	// Prevent browser features
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
	// Content Security Policy
	'Content-Security-Policy': [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: blob: https:",
		"connect-src 'self'",
		"frame-ancestors 'none'",
		"form-action 'self'",
		"base-uri 'self'"
	].join('; ')
};

export const handle: Handle = async ({ event, resolve }) => {
	// Get session ID from cookies
	const sessionId = event.cookies.get('session_id');

	if (sessionId) {
		try {
			const result = await validateSession(sessionId);

			if (result) {
				event.locals.user = {
					id: result.user.id,
					name: result.user.name,
					whatsapp: result.user.whatsapp,
					role: result.user.role,
					status: result.user.status,
					avatarUrl: result.user.avatarUrl
				};
				event.locals.session = result.session;
			} else {
				// Invalid or expired session, clear cookie
				event.cookies.delete('session_id', { path: '/' });
				event.locals.user = null;
				event.locals.session = null;
			}
		} catch {
			// Database error, clear session
			event.cookies.delete('session_id', { path: '/' });
			event.locals.user = null;
			event.locals.session = null;
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	// Protected routes
	const { pathname } = event.url;

	// Admin routes - require owner role OR admin member role
	if (pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/auth/login?redirect=' + encodeURIComponent(pathname) }
			});
		}

		// Check if accessing store-specific admin route
		const storeMatch = pathname.match(/\/admin\/stores\/(\d+)/);
		if (storeMatch) {
			const storeId = parseInt(storeMatch[1]);
			const userId = event.locals.user.id;

			// Allow if owner OR store admin
			const ownerCheck = await isStoreOwner(storeId, userId);
			const adminCheck = await isStoreAdmin(userId, storeId);

			if (!ownerCheck && !adminCheck) {
				return new Response(null, {
					status: 302,
					headers: { Location: '/app' }
				});
			}
		} else {
			// Non-store-specific admin routes require owner role
			if (event.locals.user.role !== 'owner') {
				return new Response(null, {
					status: 302,
					headers: { Location: '/app' }
				});
			}
		}
	}

	// App routes - require any authenticated user
	if (pathname.startsWith('/app')) {
		if (!event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/auth/login?redirect=' + encodeURIComponent(pathname) }
			});
		}
	}

	// Auth routes - redirect if already logged in
	if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
		if (event.locals.user) {
			const redirectTo = event.locals.user.role === 'owner' ? '/admin' : '/app';
			return new Response(null, {
				status: 302,
				headers: { Location: redirectTo }
			});
		}
	}

	// Resolve the request
	const response = await resolve(event);

	// Add security headers to all responses
	const newHeaders = new Headers(response.headers);
	for (const [key, value] of Object.entries(securityHeaders)) {
		newHeaders.set(key, value);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders
	});
};

