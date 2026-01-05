import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getStoreAuditLogs } from '$lib/server/audit';

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

	// Get all recent audit logs
	const auditLogs = await getStoreAuditLogs(storeId, 100);

	return { store, auditLogs };
};
