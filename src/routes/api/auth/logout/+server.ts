import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionId, deleteSession, clearSessionCookie } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
  const sessionId = getSessionId(event);

  if (sessionId) {
    await deleteSession(sessionId);
    clearSessionCookie(event);
  }

  throw redirect(302, '/auth/login');
};
