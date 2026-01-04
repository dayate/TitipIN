import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import { getSupplierProducts, countSupplierProducts, deleteProduct, getProductById } from '$lib/server/products';

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

	const products = await getSupplierProducts(locals.user.id, storeId);
	const counts = await countSupplierProducts(locals.user.id, storeId);

	return { store, products, counts };
};

export const actions: Actions = {
	delete: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.storeId);
		const data = await request.formData();
		const productId = parseInt(data.get('productId')?.toString() || '0');

		if (!productId) {
			return fail(400, { error: 'ID produk tidak valid' });
		}

		// Verify ownership
		const product = await getProductById(productId);
		if (!product || product.supplierId !== locals.user.id || product.storeId !== storeId) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk menghapus produk ini' });
		}

		await deleteProduct(productId);
		return { success: true };
	}
};
