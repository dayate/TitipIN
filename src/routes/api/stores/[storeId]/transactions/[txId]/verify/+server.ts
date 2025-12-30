import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailyTransactions, transactionItems, stores, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// POST: Verify transaction (draft -> verified)
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);
    const txId = parseInt(params.txId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if store exists and user is owner
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    if (store.ownerId !== user.id) {
      return json({ error: 'Anda bukan pemilik lapak ini' }, { status: 403 });
    }

    // Get transaction
    const [transaction] = await db
      .select()
      .from(dailyTransactions)
      .where(and(
        eq(dailyTransactions.id, txId),
        eq(dailyTransactions.storeId, storeId)
      ))
      .limit(1);

    if (!transaction) {
      return json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    if (transaction.status !== 'draft') {
      return json({ error: 'Transaksi sudah diverifikasi' }, { status: 400 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return json({ error: 'Data tidak valid' }, { status: 400 });
    }

    // Update each item with actual quantity
    let totalActual = 0;
    for (const item of items) {
      await db
        .update(transactionItems)
        .set({ qtyActual: item.qtyActual })
        .where(eq(transactionItems.id, item.id));

      totalActual += item.qtyActual;
    }

    // Update transaction status to verified
    await db
      .update(dailyTransactions)
      .set({
        status: 'verified',
        totalItemsIn: totalActual,
      })
      .where(eq(dailyTransactions.id, txId));

    return json({
      success: true,
      message: 'Transaksi berhasil diverifikasi',
    });
  } catch (error) {
    console.error('Verify transaction error:', error);
    return json({ error: 'Gagal memverifikasi transaksi' }, { status: 500 });
  }
};
