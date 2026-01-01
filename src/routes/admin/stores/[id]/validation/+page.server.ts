import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { createNotification } from '$lib/server/notifications';
import {
	getStoreTransactions,
	getTransactionItems,
	upsertTransactionItem,
	verifyTransaction,
	getTodayDate,
	getTransactionById
} from '$lib/server/transactions';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user || locals.user.role !== 'owner') {
		throw error(403, 'Akses ditolak');
	}

	const storeId = parseInt(params.id);
	const store = await getStoreById(storeId);

	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	if (store.ownerId !== locals.user.id) {
		throw error(403, 'Anda bukan pemilik lapak ini');
	}

	// Get all draft transactions (regardless of items count)
	const draftTransactions = await getStoreTransactions(storeId, { status: 'draft' });

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		draftTransactions.map(async ({ transaction, supplier }) => {
			const items = await getTransactionItems(transaction.id);
			return { transaction, supplier, items };
		})
	);

	return { store, transactions: transactionsWithItems };
};

export const actions: Actions = {
	verify: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.role !== 'owner') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const storeId = parseInt(params.id);
		const store = await getStoreById(storeId);

		if (!store || store.ownerId !== locals.user.id) {
			return fail(403, { error: 'Anda bukan pemilik lapak ini' });
		}

		const data = await request.formData();
		const trxId = parseInt(data.get('trxId')?.toString() || '0');
		const adminNote = data.get('adminNote')?.toString().trim();

		if (!trxId) {
			return fail(400, { error: 'ID transaksi tidak valid' });
		}

		// Update actual quantities
		const itemIds = data.getAll('itemId');
		const actualQtys = data.getAll('qtyActual');

		for (let i = 0; i < itemIds.length; i++) {
			const productId = parseInt(itemIds[i]?.toString() || '0');
			const qtyActual = parseInt(actualQtys[i]?.toString() || '0');

			if (productId) {
				await upsertTransactionItem({
					trxId,
					productId,
					qtyActual
				});
			}
		}

		// Verify transaction
		await verifyTransaction(trxId, adminNote);

		// Notify supplier
		const trx = await getTransactionById(trxId);
		if (trx) {
			await createNotification({
				userId: trx.supplierId,
				type: 'info',
				title: 'Setoran Divalidasi ✅',
				message: `Setoran Anda untuk tanggal ${trx.date} telah divalidasi oleh ${store.name}. Silakan pantau penjualan.`,
				detailUrl: `/app/${storeId}/history`,
				relatedStoreId: storeId
			});
		}

		return { success: true, trxId };
	}
};
