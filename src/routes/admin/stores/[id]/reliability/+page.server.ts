import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getStoreSupplierReliability, getLowReliabilitySuppliers } from '$lib/server/reliability';

export const load: PageServerLoad = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	if (!locals.user || locals.user.role !== 'owner') {
		throw error(403, 'Akses ditolak');
	}

	const isOwner = await isStoreOwner(storeId, locals.user.id);
	if (!isOwner) {
		throw error(403, 'Anda tidak memiliki akses ke lapak ini');
	}

	const store = await getStoreById(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	const supplierReliability = await getStoreSupplierReliability(storeId);
	const lowReliabilitySuppliers = await getLowReliabilitySuppliers(storeId, 50);

	return {
		store,
		supplierReliability,
		lowReliabilitySuppliers
	};
};
