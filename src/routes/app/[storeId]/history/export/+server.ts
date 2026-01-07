import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isActiveMember } from '$lib/server/members';
import { getSupplierTransactions, getTransactionItems } from '$lib/server/transactions';
import type { TransactionStatus } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw error(401, 'Silakan login terlebih dahulu');
	}

	const storeId = parseInt(params.storeId);

	// Verify membership
	const isMember = await isActiveMember(locals.user.id, storeId);
	if (!isMember) {
		throw error(403, 'Anda bukan anggota aktif lapak ini');
	}

	// Get filter params
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

	// Generate CSV
	const headers = ['Tanggal', 'Status', 'Produk', 'Masuk', 'Terjual', 'Retur', 'Keuntungan'];
	const rows: string[][] = [headers];

	for (const trx of transactionsWithItems) {
		if (trx.items.length === 0) {
			rows.push([trx.date, trx.status, '-', '0', '0', '0', '0']);
		} else {
			for (const { item, product } of trx.items) {
				const qtySold = item.qtyActual - item.qtyReturned;
				const profit = qtySold * product.priceBuy;
				rows.push([
					trx.date,
					trx.status,
					product.name,
					String(item.qtyActual),
					String(qtySold),
					String(item.qtyReturned),
					String(profit)
				]);
			}
		}
	}

	const csv = rows
		.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
		.join('\n');
	const filename = `riwayat_${storeId}_${new Date().toISOString().split('T')[0]}.csv`;

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
