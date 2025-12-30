import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailyTransactions, transactionItems, stores, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// POST: Complete transaction (verified -> completed)
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

    if (transaction.status !== 'verified') {
      return json({ error: 'Transaksi belum diverifikasi' }, { status: 400 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return json({ error: 'Data tidak valid' }, { status: 400 });
    }

    // Update each item with returned quantity and calculate payout
    let totalSold = 0;
    let totalPayout = 0;

    for (const item of items) {
      // Get current item data with product info
      const [currentItem] = await db
        .select({
          id: transactionItems.id,
          qtyActual: transactionItems.qtyActual,
          productId: transactionItems.productId,
          priceBuy: products.priceBuy,
        })
        .from(transactionItems)
        .innerJoin(products, eq(transactionItems.productId, products.id))
        .where(eq(transactionItems.id, item.id))
        .limit(1);

      if (currentItem) {
        const qtySold = currentItem.qtyActual - item.qtyReturned;
        totalSold += qtySold;
        totalPayout += qtySold * currentItem.priceBuy;

        await db
          .update(transactionItems)
          .set({ qtyReturned: item.qtyReturned })
          .where(eq(transactionItems.id, item.id));
      }
    }

    // Update transaction status to completed
    await db
      .update(dailyTransactions)
      .set({
        status: 'completed',
        totalItemsSold: totalSold,
        totalPayout: totalPayout,
      })
      .where(eq(dailyTransactions.id, txId));

    return json({
      success: true,
      message: 'Transaksi berhasil diselesaikan',
      totalSold,
      totalPayout,
    });
  } catch (error) {
    console.error('Complete transaction error:', error);
    return json({ error: 'Gagal menyelesaikan transaksi' }, { status: 500 });
  }
};
