import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import {
	getSupplierTransactions,
	getTransactionItems,
	deleteTransactions
} from '$lib/server/transactions';
import type { TransactionStatus } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const storeId = parseInt(params.storeId);
	const store = await getStoreById(storeId);

	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	// Check if user is active member
	const isMember = await isActiveMember(locals.user.id, storeId);
	if (!isMember) {
		throw error(403, 'Anda bukan anggota aktif lapak ini');
	}

	// Get filter params from URL
	const statusFilter = url.searchParams.get('status') as TransactionStatus | null;
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	// Get transactions with filters
	const transactions = await getSupplierTransactions(locals.user.id, storeId, {
		status: statusFilter || undefined,
		startDate: startDate || undefined,
		endDate: endDate || undefined
	});

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		transactions.map(async (trx) => {
			const items = await getTransactionItems(trx.id);
			return { ...trx, items };
		})
	);

	return {
		store,
		transactions: transactionsWithItems,
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

		const storeId = parseInt(params.storeId);
		const isMember = await isActiveMember(locals.user.id, storeId);
		if (!isMember) {
			return fail(403, { error: 'Anda bukan anggota aktif lapak ini' });
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
