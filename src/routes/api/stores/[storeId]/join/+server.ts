import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { storeMembers, stores } from '$lib/server/db/schema';
import { eq, and, or } from 'drizzle-orm';

// POST: Request to join store (via invite code OR regular request)
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    console.log(`[Join] User ${user?.id} attempting to join store ${storeId}`);

    if (!user) {
      console.log('[Join] Unauthorized - no user');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'supplier') {
      console.log(`[Join] Forbidden - user role is ${user.role}`);
      return json({ error: 'Hanya penyetor yang bisa mengajukan gabung' }, { status: 403 });
    }

    // Check if store exists
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      console.log(`[Join] Store ${storeId} not found`);
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    // Check if already a member or has pending request
    const [existing] = await db
      .select()
      .from(storeMembers)
      .where(and(
        eq(storeMembers.storeId, storeId),
        eq(storeMembers.userId, user.id)
      ))
      .limit(1);

    if (existing) {
      if (existing.status === 'active') {
        console.log(`[Join] User ${user.id} already active member of store ${storeId}`);
        return json({ error: 'Anda sudah menjadi anggota lapak ini' }, { status: 409 });
      }
      if (existing.status === 'pending') {
        console.log(`[Join] User ${user.id} already has pending request for store ${storeId}`);
        return json({ error: 'Permintaan gabung sudah diajukan, tunggu persetujuan' }, { status: 409 });
      }
    }

    const { message, inviteCode } = await request.json();

    // Check if using invite code
    let status: 'pending' | 'active' = 'pending';

    if (inviteCode) {
      // Verify invite code
      if (store.inviteCode && inviteCode.toUpperCase() === store.inviteCode.toUpperCase()) {
        status = 'active'; // Auto-approve with valid invite code
        console.log(`[Join] Valid invite code used, auto-approving user ${user.id}`);
      } else {
        console.log(`[Join] Invalid invite code: ${inviteCode}`);
        return json({ error: 'Kode invite tidak valid' }, { status: 400 });
      }
    }

    // Create join request/membership
    const [membership] = await db.insert(storeMembers).values({
      storeId,
      userId: user.id,
      status,
      requestMessage: message || null,
      joinedAt: status === 'active' ? new Date() : null,
    }).returning();

    console.log(`[Join] Membership created: user ${user.id} -> store ${storeId}, status: ${status}`);

    return json({
      success: true,
      message: status === 'active'
        ? 'Berhasil bergabung ke lapak!'
        : 'Permintaan gabung berhasil dikirim, tunggu persetujuan',
      membership,
      autoApproved: status === 'active',
    });
  } catch (error) {
    console.error('[Join] Error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
};
