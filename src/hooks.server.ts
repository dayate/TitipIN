import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { isStoreAdmin } from '$lib/server/members';
import { isStoreOwner } from '$lib/server/stores';

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

	const response = await resolve(event);
	return response;
};
