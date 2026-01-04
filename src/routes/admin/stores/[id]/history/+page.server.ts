import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import {
	getStoreTransactions,
	getTransactionItems,
	deleteTransactions
} from '$lib/server/transactions';
import type { TransactionStatus } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals, url }) => {
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

	// Get filter params from URL
	const statusFilter = url.searchParams.get('status') as TransactionStatus | null;
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	// Get all transactions with filters
	const allTransactions = await getStoreTransactions(storeId, {
		status: statusFilter || undefined,
		date: undefined
	});

	// Apply date filters
	let filteredTransactions = allTransactions;
	if (startDate) {
		filteredTransactions = filteredTransactions.filter(t => t.transaction.date >= startDate);
	}
	if (endDate) {
		filteredTransactions = filteredTransactions.filter(t => t.transaction.date <= endDate);
	}

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		filteredTransactions.map(async ({ transaction, supplier }) => {
			const items = await getTransactionItems(transaction.id);
			return { transaction, supplier, items };
		})
	);

	// Count by status (from filtered results)
	const counts = {
		total: transactionsWithItems.length,
		draft: transactionsWithItems.filter(t => t.transaction.status === 'draft').length,
		verified: transactionsWithItems.filter(t => t.transaction.status === 'verified').length,
		completed: transactionsWithItems.filter(t => t.transaction.status === 'completed').length
	};

	return {
		store,
		transactions: transactionsWithItems,
		counts,
		filters: {
			status: statusFilter,
			startDate,
			endDate
		}
	};
};

export const actions: Actions = {
	delete: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user.id);
		if (!isOwner) {
			return fail(403, { error: 'Anda bukan pemilik lapak ini' });
		}

		const data = await request.formData();
		const transactionIdsStr = data.get('transactionIds')?.toString();

		if (!transactionIdsStr) {
			return fail(400, { error: 'Pilih minimal satu riwayat untuk dihapus' });
		}

		const transactionIds = transactionIdsStr.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

		if (transactionIds.length === 0) {
			return fail(400, { error: 'Pilih minimal satu riwayat untuk dihapus' });
		}

		try {
			const deleted = await deleteTransactions(transactionIds);
			return { success: true, deleted };
		} catch (err) {
			console.error('Delete transactions error:', err);
			return fail(500, { error: 'Gagal menghapus riwayat' });
		}
	}
};
