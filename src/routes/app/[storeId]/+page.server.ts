import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import { countSupplierProducts, getApprovedProducts } from '$lib/server/products';
import { getSupplierTransactions, getTomorrowDate } from '$lib/server/transactions';

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

	// Get product counts
	const counts = await countSupplierProducts(locals.user.id, storeId);

	// Get approved products for setoran modal
	const approvedProducts = await getApprovedProducts(storeId, locals.user.id);

	// Get transactions for stats
	const transactions = await getSupplierTransactions(locals.user.id, storeId);
	const transactionCount = transactions.length;
	const totalEarnings = transactions
		.filter((t) => t.status === 'completed')
		.reduce((sum, t) => sum + t.totalPayout, 0);

	// Get tomorrow's date for setoran
	const setoranDate = getTomorrowDate();

	return {
		store,
		counts,
		transactionCount,
		totalEarnings,
		approvedProducts,
		setoranDate
	};
};
