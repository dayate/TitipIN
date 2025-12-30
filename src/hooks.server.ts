import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession, getSessionId } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  // Get session from cookie
  const sessionId = getSessionId(event);

  if (sessionId) {
    const user = await validateSession(sessionId);
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  const { pathname } = event.url;

  // Protect owner routes (pemilik lapak area)
  if (pathname.startsWith('/owner')) {
    if (!event.locals.user) {
      throw redirect(302, '/auth/login');
    }
    if (event.locals.user.role !== 'owner') {
      throw redirect(302, '/app');
    }
    if (event.locals.user.status !== 'active') {
      throw redirect(302, '/auth/login?error=pending');
    }
  }

  // Protect app routes (supplier/penyetor area)
  if (pathname.startsWith('/app')) {
    if (!event.locals.user) {
      throw redirect(302, '/auth/login');
    }
    if (event.locals.user.status !== 'active') {
      throw redirect(302, '/auth/login?error=pending');
    }
  }

  // Protect stores routes that require auth (join, etc)
  if (pathname.match(/^\/stores\/[^\/]+\/join/)) {
    if (!event.locals.user) {
      throw redirect(302, '/auth/login');
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/') && event.locals.user) {
    if (event.locals.user.role === 'owner') {
      throw redirect(302, '/owner');
    } else {
      throw redirect(302, '/app');
    }
  }

  return resolve(event);
};
