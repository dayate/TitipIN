import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPin, createSession, setSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
  try {
    const { whatsapp, pin } = await event.request.json();

    if (!whatsapp || !pin) {
      return json({ error: 'Nomor WA dan PIN wajib diisi' }, { status: 400 });
    }

    // Find user by whatsapp
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.whatsapp, whatsapp))
      .limit(1);

    if (!user) {
      return json({ error: 'Nomor WA tidak terdaftar' }, { status: 401 });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return json({ error: 'Akun belum diaktifkan atau diblokir' }, { status: 403 });
    }

    // Verify PIN
    const validPin = await verifyPin(pin, user.pinHash);
    if (!validPin) {
      return json({ error: 'PIN salah' }, { status: 401 });
    }

    // Create session
    const sessionId = await createSession(user.id);
    setSessionCookie(event, sessionId);

    return json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        whatsapp: user.whatsapp,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
