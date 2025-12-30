import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, pinResetRequests, notifications, sessions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPin, validateSession, getSessionId } from '$lib/server/auth';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async (event) => {
  try {
    // Validate admin session
    const sessionId = getSessionId(event);
    if (!sessionId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await validateSession(sessionId);
    if (!admin || admin.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, newPin, requestId } = await event.request.json();

    if (!userId || !newPin) {
      return json({ error: 'User ID dan PIN baru wajib diisi' }, { status: 400 });
    }

    if (newPin.length !== 6) {
      return json({ error: 'PIN harus 6 digit' }, { status: 400 });
    }

    // Find the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Hash the new PIN
    const pinHash = await hashPin(newPin);

    // Update user's PIN
    await db
      .update(users)
      .set({ pinHash })
      .where(eq(users.id, userId));

    // Invalidate all existing sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // If there's a request ID, mark it as completed
    if (requestId) {
      await db
        .update(pinResetRequests)
        .set({
          status: 'completed',
          processedAt: new Date(),
        })
        .where(eq(pinResetRequests.id, requestId));
    } else {
      // Mark any pending requests as completed
      await db
        .update(pinResetRequests)
        .set({
          status: 'completed',
          processedAt: new Date(),
        })
        .where(
          and(
            eq(pinResetRequests.userId, userId),
            eq(pinResetRequests.status, 'pending')
          )
        );
    }

    // Create notification for user
    await db.insert(notifications).values({
      userId: user.id,
      type: 'success',
      title: 'PIN Berhasil Direset',
      message: 'PIN Anda telah direset oleh admin. Silakan login dengan PIN baru Anda.',
    });

    return json({
      success: true,
      message: `PIN untuk ${user.name} berhasil direset`,
    });
  } catch (error) {
    console.error('Reset PIN error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};

// GET endpoint to list pending reset requests (for admin)
export const GET: RequestHandler = async (event) => {
  try {
    // Validate admin session
    const sessionId = getSessionId(event);
    if (!sessionId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await validateSession(sessionId);
    if (!admin || admin.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get pending reset requests with user info
    const requests = await db
      .select({
        id: pinResetRequests.id,
        userId: pinResetRequests.userId,
        status: pinResetRequests.status,
        createdAt: pinResetRequests.createdAt,
        userName: users.name,
        userPhone: users.whatsapp,
      })
      .from(pinResetRequests)
      .leftJoin(users, eq(pinResetRequests.userId, users.id))
      .where(eq(pinResetRequests.status, 'pending'))
      .orderBy(pinResetRequests.createdAt);

    return json({ requests });
  } catch (error) {
    console.error('Get reset requests error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
