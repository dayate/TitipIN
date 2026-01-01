import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import { getSupplierTransactions, getTransactionItems } from '$lib/server/transactions';

export const load: PageServerLoad = async ({ params, locals }) => {
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

	// Get transactions
	const transactions = await getSupplierTransactions(locals.user.id, storeId);

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		transactions.map(async (trx) => {
			const items = await getTransactionItems(trx.id);
			return { ...trx, items };
		})
	);

	return { store, transactions: transactionsWithItems };
};
