import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

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

	// Admin routes - require owner role
	if (pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/auth/login?redirect=' + encodeURIComponent(pathname) }
			});
		}
		if (event.locals.user.role !== 'owner') {
			return new Response(null, {
				status: 302,
				headers: { Location: '/app' }
			});
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
