import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import { getApprovedProducts } from '$lib/server/products';
import { createNotification } from '$lib/server/notifications';
import {
	getOrCreateTransaction,
	upsertTransactionItem,
	getTransactionItems,
	updateTransactionTotals,
	getTomorrowDate,
	getTodayDate
} from '$lib/server/transactions';

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

	// Check if store is open
	if (!store.isOpen) {
		return {
			store,
			products: [],
			transaction: null,
			items: [],
			date: getTomorrowDate(),
			storeClosed: true
		};
	}

	// Get approved products for this supplier
	const products = await getApprovedProducts(storeId, locals.user.id);

	// Get date from URL or use tomorrow
	const dateParam = url.searchParams.get('date');
	const date = dateParam || getTomorrowDate();

	// Get or create transaction for the date
	const transaction = await getOrCreateTransaction({
		date,
		storeId,
		supplierId: locals.user.id
	});

	// Get existing transaction items
	const items = await getTransactionItems(transaction.id);

	return { store, products, transaction, items, date, storeClosed: false };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.storeId);
		const store = await getStoreById(storeId);

		if (!store) {
			return fail(404, { error: 'Lapak tidak ditemukan' });
		}

		// Check if store is open
		if (!store.isOpen) {
			return fail(400, { error: 'Lapak sedang tutup, tidak bisa melakukan setoran' });
		}

		const data = await request.formData();
		const date = data.get('date')?.toString() || getTomorrowDate();

		// Get or create transaction
		const transaction = await getOrCreateTransaction({
			date,
			storeId,
			supplierId: locals.user.id
		});

		// Process each product quantity
		const productIds = data.getAll('productId');
		const quantities = data.getAll('qty');

		// Validate quantities
		const validItems: Array<{ productId: number; qty: number }> = [];
		for (let i = 0; i < productIds.length; i++) {
			const productId = parseInt(productIds[i]?.toString() || '0');
			const qty = parseInt(quantities[i]?.toString() || '0');

			// Skip invalid product IDs
			if (!productId) continue;

			// Validate quantity - must be non-negative integer
			if (qty < 0) {
				return fail(400, { error: 'Jumlah tidak boleh negatif' });
			}

			if (qty > 0) {
				validItems.push({ productId, qty });
			}
		}

		// Check if there are any items to submit
		if (validItems.length === 0) {
			return fail(400, { error: 'Pilih minimal satu produk dengan jumlah lebih dari 0' });
		}

		let totalItems = 0;
		for (const { productId, qty } of validItems) {
			await upsertTransactionItem({
				trxId: transaction.id,
				productId,
				qtyPlanned: qty
			});
			totalItems += qty;
		}

		// Update totals
		await updateTransactionTotals(transaction.id);

		// Notify admin about new setoran
		if (totalItems > 0) {
			await createNotification({
				userId: store.ownerId,
				type: 'info',
				title: 'Setoran Baru Menunggu Validasi 📦',
				message: `${locals.user.name} mengirim setoran ${totalItems} item untuk tanggal ${date}. Mohon validasi saat barang sampai.`,
				detailUrl: `/admin/stores/${storeId}/validation`,
				relatedStoreId: storeId
			});
		}

		return { success: true };
	},

	updateItem: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.storeId);
		const data = await request.formData();
		const date = data.get('date')?.toString() || getTomorrowDate();
		const productId = parseInt(data.get('productId')?.toString() || '0');
		const qty = parseInt(data.get('qty')?.toString() || '0');

		if (!productId) {
			return fail(400, { error: 'Produk tidak valid' });
		}

		// Get or create transaction
		const transaction = await getOrCreateTransaction({
			date,
			storeId,
			supplierId: locals.user.id
		});

		await upsertTransactionItem({
			trxId: transaction.id,
			productId,
			qtyPlanned: qty
		});

		await updateTransactionTotals(transaction.id);

		return { success: true };
	}
};
