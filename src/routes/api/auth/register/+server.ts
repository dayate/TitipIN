import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPin } from '$lib/server/auth';
import type { UserRole } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name, whatsapp, pin, role } = await request.json();

    console.log(`[Register] Attempting registration for: ${whatsapp}, role: ${role}`);

    if (!name || !whatsapp || !pin) {
      console.log(`[Register] Validation failed: missing fields`);
      return json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (pin.length !== 6) {
      console.log(`[Register] Validation failed: PIN not 6 digits`);
      return json({ error: 'PIN harus 6 digit' }, { status: 400 });
    }

    // Validate role
    const validRoles: UserRole[] = ['owner', 'supplier'];
    const userRole: UserRole = validRoles.includes(role) ? role : 'supplier';

    // Check if whatsapp already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.whatsapp, whatsapp))
      .limit(1);

    if (existing) {
      console.log(`[Register] Failed: WhatsApp ${whatsapp} already exists`);
      return json({ error: 'Nomor WA sudah terdaftar' }, { status: 409 });
    }

    // Hash PIN and create user
    const pinHash = await hashPin(pin);

    // Both owner and supplier get active status immediately
    // Approval is only needed when joining a specific store
    const status = 'active';

    const [newUser] = await db.insert(users).values({
      name,
      whatsapp,
      pinHash,
      role: userRole,
      status,
    }).returning();

    console.log(`[Register] Success: User ${newUser.id} created as ${userRole}`);

    return json({
      success: true,
      message: userRole === 'owner'
        ? 'Pendaftaran berhasil! Silakan buat lapak pertama Anda.'
        : 'Pendaftaran berhasil! Silakan cari dan gabung ke lapak.',
      user: {
        id: newUser.id,
        name: newUser.name,
        whatsapp: newUser.whatsapp,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('[Register] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};

