import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { getStoreProducts, approveProduct, rejectProduct, getProductById, countStoreProductsByStatus, deleteProduct } from '$lib/server/products';
import { createNotification } from '$lib/server/notifications';

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

	const products = await getStoreProducts(storeId);
	const counts = await countStoreProductsByStatus(storeId);

	// Group products by supplier
	const supplierMap = new Map<number, { supplier: { id: number; name: string }; products: typeof products }>();
	for (const item of products) {
		const supplierId = item.supplier.id;
		if (!supplierMap.has(supplierId)) {
			supplierMap.set(supplierId, { supplier: item.supplier, products: [] });
		}
		supplierMap.get(supplierId)!.products.push(item);
	}
	const productsBySupplier = Array.from(supplierMap.values());

	return { store, products, productsBySupplier, counts };
};

export const actions: Actions = {
	approve: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.role !== 'owner') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const storeId = parseInt(params.id);
		const data = await request.formData();
		const productId = parseInt(data.get('productId')?.toString() || '0');
		const priceSell = parseInt(data.get('priceSell')?.toString() || '0');

		if (!productId) {
			return fail(400, { error: 'ID produk tidak valid' });
		}

		if (priceSell <= 0) {
			return fail(400, { error: 'Harga jual harus lebih dari 0' });
		}

		const product = await getProductById(productId);
		if (!product || product.storeId !== storeId) {
			return fail(404, { error: 'Produk tidak ditemukan' });
		}

		if (priceSell < product.priceBuy) {
			return fail(400, { error: 'Harga jual tidak boleh lebih kecil dari harga setor' });
		}

		const store = await getStoreById(storeId);
		if (!store || store.ownerId !== locals.user.id) {
			return fail(403, { error: 'Anda bukan pemilik lapak ini' });
		}

		await approveProduct(productId, priceSell);

		// Log audit
		const { logProductAudit } = await import('$lib/server/audit');
		await logProductAudit(
			productId,
			'product_approved',
			locals.user.id,
			{ status: 'pending' },
			{ status: 'approved', priceSell }
		);

		// Notify supplier with price info
		await createNotification({
			userId: product.supplierId,
			type: 'product_approved',
			title: 'Produk Disetujui! 🎉',
			message: `Produk "${product.name}" telah disetujui dengan harga jual Rp ${priceSell.toLocaleString('id-ID')}. Anda sekarang bisa mulai menyetorkan produk ini.`,
			detailUrl: `/app/${storeId}/products`,
			relatedStoreId: storeId
		});

		return { success: true, action: 'approve', productName: product.name };
	},

	reject: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.role !== 'owner') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const storeId = parseInt(params.id);
		const data = await request.formData();
		const productId = parseInt(data.get('productId')?.toString() || '0');
		const reason = data.get('reason')?.toString().trim();

		if (!productId) {
			return fail(400, { error: 'ID produk tidak valid' });
		}

		const product = await getProductById(productId);
		if (!product || product.storeId !== storeId) {
			return fail(404, { error: 'Produk tidak ditemukan' });
		}

		const store = await getStoreById(storeId);
		if (!store || store.ownerId !== locals.user.id) {
			return fail(403, { error: 'Anda bukan pemilik lapak ini' });
		}

		await rejectProduct(productId);

		// Log audit
		const { logProductAudit } = await import('$lib/server/audit');
		await logProductAudit(
			productId,
			'product_rejected',
			locals.user.id,
			{ status: 'pending' },
			{ status: 'rejected' },
			reason
		);

		// Notify supplier
		await createNotification({
			userId: product.supplierId,
			type: 'product_rejected',
			title: 'Produk Ditolak',
			message: reason
				? `Produk "${product.name}" ditolak oleh ${store.name}. Alasan: ${reason}`
				: `Produk "${product.name}" ditolak oleh ${store.name}. Silakan hubungi admin untuk informasi lebih lanjut.`,
			detailUrl: `/app/${storeId}/products`,
			relatedStoreId: storeId
		});

		return { success: true, action: 'reject', productName: product.name };
	},

	delete: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.role !== 'owner') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const storeId = parseInt(params.id);
		const data = await request.formData();
		const productId = parseInt(data.get('productId')?.toString() || '0');

		if (!productId) {
			return fail(400, { error: 'ID produk tidak valid' });
		}

		const product = await getProductById(productId);
		if (!product || product.storeId !== storeId) {
			return fail(404, { error: 'Produk tidak ditemukan' });
		}

		const store = await getStoreById(storeId);
		if (!store || store.ownerId !== locals.user.id) {
			return fail(403, { error: 'Anda bukan pemilik lapak ini' });
		}

		const productName = product.name;
		await deleteProduct(productId);

		// Notify supplier
		await createNotification({
			userId: product.supplierId,
			type: 'info',
			title: 'Produk Dihapus',
			message: `Produk "${productName}" telah dihapus dari lapak ${store.name} oleh admin.`,
			detailUrl: `/app/${storeId}/products`,
			relatedStoreId: storeId
		});

		return { success: true, action: 'delete', productName };
	}
};
