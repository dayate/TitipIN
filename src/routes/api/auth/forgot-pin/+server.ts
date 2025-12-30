import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, pinResetRequests, notifications } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { whatsapp } = await request.json();

    if (!whatsapp) {
      return json({ error: 'Nomor WA wajib diisi' }, { status: 400 });
    }

    // Find user by whatsapp
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.whatsapp, whatsapp))
      .limit(1);

    if (!user) {
      // Don't reveal if user exists or not for security
      return json({
        success: true,
        message: 'Jika nomor WA terdaftar, permintaan reset PIN akan diproses.'
      });
    }

    // Check if there's already a pending request
    const [existingRequest] = await db
      .select()
      .from(pinResetRequests)
      .where(
        and(
          eq(pinResetRequests.userId, user.id),
          eq(pinResetRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingRequest) {
      return json({
        success: true,
        message: 'Permintaan reset PIN sudah diajukan. Tunggu konfirmasi admin.'
      });
    }

    // Create new reset request
    await db.insert(pinResetRequests).values({
      userId: user.id,
      status: 'pending',
    });

    // Create notification for admins
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'));

    for (const admin of admins) {
      await db.insert(notifications).values({
        userId: admin.id,
        type: 'warning',
        title: 'Permintaan Reset PIN',
        message: `${user.name} (${user.whatsapp}) meminta reset PIN.`,
      });
    }

    return json({
      success: true,
      message: 'Permintaan reset PIN berhasil diajukan. Tunggu konfirmasi admin.'
    });
  } catch (error) {
    console.error('Forgot PIN error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
