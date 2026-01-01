import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { getTransactionById, getTransactionItems } from '$lib/server/transactions';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user || locals.user.role !== 'owner') {
		throw error(403, 'Akses ditolak');
	}

	const storeId = parseInt(params.id);
	const trxId = parseInt(params.trxId);

	const store = await getStoreById(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	if (store.ownerId !== locals.user.id) {
		throw error(403, 'Anda bukan pemilik lapak ini');
	}

	const transaction = await getTransactionById(trxId);
	if (!transaction || transaction.storeId !== storeId) {
		throw error(404, 'Transaksi tidak ditemukan');
	}

	const items = await getTransactionItems(trxId);

	// Calculate totals
	let totalQtyActual = 0;
	let totalQtySold = 0;
	let totalQtyReturned = 0;
	let totalRevenue = 0;
	let totalProfit = 0;

	for (const { item, product } of items) {
		const sold = item.qtyActual - item.qtyReturned;
		totalQtyActual += item.qtyActual;
		totalQtySold += sold;
		totalQtyReturned += item.qtyReturned;
		totalRevenue += sold * product.priceSell;
		totalProfit += sold * (product.priceSell - product.priceBuy);
	}

	return {
		store,
		transaction,
		items,
		summary: {
			totalQtyActual,
			totalQtySold,
			totalQtyReturned,
			totalRevenue,
			totalProfit,
			totalPayout: transaction.totalPayout
		}
	};
};
