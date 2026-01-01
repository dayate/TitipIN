import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { createNotification } from '$lib/server/notifications';
import {
	getStoreTransactions,
	getTransactionItems,
	upsertTransactionItem,
	completeTransaction,
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

	// Get all verified transactions (ready for return input)
	const verifiedTransactions = await getStoreTransactions(storeId, { status: 'verified' });

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		verifiedTransactions.map(async ({ transaction, supplier }) => {
			const items = await getTransactionItems(transaction.id);
			return { transaction, supplier, items };
		})
	);

	return { store, transactions: transactionsWithItems };
};

export const actions: Actions = {
	complete: async ({ request, locals, params }) => {
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

		if (!trxId) {
			return fail(400, { error: 'ID transaksi tidak valid' });
		}

		// Update returned quantities
		const itemIds = data.getAll('itemId');
		const returnedQtys = data.getAll('qtyReturned');

		for (let i = 0; i < itemIds.length; i++) {
			const productId = parseInt(itemIds[i]?.toString() || '0');
			const qtyReturned = parseInt(returnedQtys[i]?.toString() || '0');

			if (productId) {
				await upsertTransactionItem({
					trxId,
					productId,
					qtyReturned
				});
			}
		}

		// Complete transaction
		const completedTrx = await completeTransaction(trxId);

		// Get items for detailed notification
		const items = await getTransactionItems(trxId);

		// Notify supplier with detailed info
		if (completedTrx) {
			const payout = completedTrx.totalPayout;

			// Build detailed message
			let soldItems: string[] = [];
			let unsoldItems: string[] = [];

			for (const { item, product } of items) {
				const sold = item.qtyActual - item.qtyReturned;
				if (sold > 0) {
					soldItems.push(`• ${product.name}: ${sold} terjual`);
				}
				if (item.qtyReturned > 0) {
					unsoldItems.push(`• ${product.name}: ${item.qtyReturned} retur`);
				}
			}

			let detailMessage = `Transaksi tanggal ${completedTrx.date} telah selesai.\n\n`;
			if (soldItems.length > 0) {
				detailMessage += `✅ Terjual:\n${soldItems.join('\n')}\n\n`;
			}
			if (unsoldItems.length > 0) {
				detailMessage += `↩️ Retur:\n${unsoldItems.join('\n')}\n\n`;
			}
			detailMessage += `💰 Pendapatan Anda: Rp ${payout.toLocaleString('id-ID')}`;

			await createNotification({
				userId: completedTrx.supplierId,
				type: 'info',
				title: 'Transaksi Selesai! 💰',
				message: detailMessage,
				detailUrl: `/app/${storeId}/history`,
				relatedStoreId: storeId
			});
		}

		return { success: true, trxId };
	}
};
