import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { getStoreTransactions, getTransactionItems } from '$lib/server/transactions';

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

	// Get all transactions
	const allTransactions = await getStoreTransactions(storeId);

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		allTransactions.map(async ({ transaction, supplier }) => {
			const items = await getTransactionItems(transaction.id);
			return { transaction, supplier, items };
		})
	);

	// Count by status
	const counts = {
		total: transactionsWithItems.length,
		draft: transactionsWithItems.filter(t => t.transaction.status === 'draft').length,
		verified: transactionsWithItems.filter(t => t.transaction.status === 'verified').length,
		completed: transactionsWithItems.filter(t => t.transaction.status === 'completed').length
	};

	return { store, transactions: transactionsWithItems, counts };
};
