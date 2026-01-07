import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getStoreTransactions, getTransactionItems } from '$lib/server/transactions';
import type { TransactionStatus } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw error(401, 'Silakan login terlebih dahulu');
	}

	const storeId = parseInt(params.id);
	const store = await getStoreById(storeId);

	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	const isOwner = await isStoreOwner(storeId, locals.user.id);
	if (!isOwner) {
		throw error(403, 'Anda bukan pemilik lapak ini');
	}

	// Get filter params
	const statusFilter = url.searchParams.get('status') as TransactionStatus | null;
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	// Get all transactions with filters
	const allTransactions = await getStoreTransactions(storeId, {
		status: statusFilter || undefined
	});

	// Apply date filters
	let filteredTransactions = allTransactions;
	if (startDate) {
		filteredTransactions = filteredTransactions.filter((t) => t.transaction.date >= startDate);
	}
	if (endDate) {
		filteredTransactions = filteredTransactions.filter((t) => t.transaction.date <= endDate);
	}

	// Get items for each transaction
	const transactionsWithItems = await Promise.all(
		filteredTransactions.map(async ({ transaction, supplier }) => {
			const items = await getTransactionItems(transaction.id);
			return { transaction, supplier, items };
		})
	);

	// Generate CSV with supplier info for admin
	const headers = [
		'Tanggal',
		'Penyetor',
		'Produk',
		'Masuk',
		'Terjual',
		'Retur',
		'Payout',
		'Status'
	];
	const rows: string[][] = [headers];

	for (const { transaction, supplier, items } of transactionsWithItems) {
		if (items.length === 0) {
			rows.push([transaction.date, supplier.name, '-', '0', '0', '0', '0', transaction.status]);
		} else {
			for (const { item, product } of items) {
				const qtySold = item.qtyActual - item.qtyReturned;
				const payout = qtySold * product.priceBuy;
				rows.push([
					transaction.date,
					supplier.name,
					product.name,
					String(item.qtyActual),
					String(qtySold),
					String(item.qtyReturned),
					String(payout),
					transaction.status
				]);
			}
		}
	}

	const csv = rows
		.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
		.join('\n');
	const filename = `riwayat_admin_${storeId}_${new Date().toISOString().split('T')[0]}.csv`;

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
