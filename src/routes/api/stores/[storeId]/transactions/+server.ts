import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailyTransactions, transactionItems, stores, storeMembers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// POST: Create daily transaction (setor)
export const POST: RequestHandler = async ({ request, locals, params }) => {
  try {
    const user = locals.user;
    const storeId = parseInt(params.storeId);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if store exists and is open
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return json({ error: 'Lapak tidak ditemukan' }, { status: 404 });
    }

    if (!store.isOpen) {
      return json({ error: 'Lapak sedang tutup' }, { status: 400 });
    }

    // Check membership
    const [membership] = await db
      .select()
      .from(storeMembers)
      .where(and(
        eq(storeMembers.storeId, storeId),
        eq(storeMembers.userId, user.id),
        eq(storeMembers.status, 'active')
      ))
      .limit(1);

    if (!membership && store.ownerId !== user.id) {
      return json({ error: 'Anda bukan anggota lapak ini' }, { status: 403 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ error: 'Data setoran tidak valid' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if there's already a transaction for today
    let [existingTx] = await db
      .select()
      .from(dailyTransactions)
      .where(and(
        eq(dailyTransactions.storeId, storeId),
        eq(dailyTransactions.supplierId, user.id),
        eq(dailyTransactions.date, today)
      ))
      .limit(1);

    let trxId: number;
    const totalItems = items.reduce((sum: number, item: { qty: number }) => sum + item.qty, 0);

    if (existingTx) {
      // Update existing transaction
      await db
        .update(dailyTransactions)
        .set({
          totalItemsIn: existingTx.totalItemsIn + totalItems,
        })
        .where(eq(dailyTransactions.id, existingTx.id));
      trxId = existingTx.id;
    } else {
      // Create new transaction
      const [newTx] = await db.insert(dailyTransactions).values({
        date: today,
        storeId,
        supplierId: user.id,
        status: 'draft',
        totalItemsIn: totalItems,
        totalItemsSold: 0,
        totalPayout: 0,
      }).returning();
      trxId = newTx.id;
    }

    // Add transaction items
    for (const item of items) {
      // Check if item already exists
      const [existingItem] = await db
        .select()
        .from(transactionItems)
        .where(and(
          eq(transactionItems.trxId, trxId),
          eq(transactionItems.productId, item.productId)
        ))
        .limit(1);

      if (existingItem) {
        // Update existing item
        await db
          .update(transactionItems)
          .set({
            qtyPlanned: existingItem.qtyPlanned + item.qty,
          })
          .where(eq(transactionItems.id, existingItem.id));
      } else {
        // Create new item
        await db.insert(transactionItems).values({
          trxId,
          productId: item.productId,
          qtyPlanned: item.qty,
          qtyActual: 0,
          qtyReturned: 0,
        });
      }
    }

    return json({
      success: true,
      message: 'Setoran berhasil disimpan',
      transactionId: trxId,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return json({ error: 'Gagal menyimpan setoran' }, { status: 500 });
  }
};
