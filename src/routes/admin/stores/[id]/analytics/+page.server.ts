import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getStoreDashboardData, getRevenueByPeriod } from '$lib/server/analytics';
import { getTodayDate, formatDateISO } from '$lib/utils';

export const load: PageServerLoad = async ({ params, locals, url }) => {
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

	// Get period from URL params or default to last 30 days
	const period = url.searchParams.get('period') || '30';
	const days = parseInt(period);

	const today = getTodayDate();
	const startDate = formatDateISO(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

	const dashboardData = await getStoreDashboardData(storeId, startDate, today);
	const revenueData = await getRevenueByPeriod(storeId, startDate, today);

	return {
		store,
		dashboardData,
		revenueData,
		period: days
	};
};
