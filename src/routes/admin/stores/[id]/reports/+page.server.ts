import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import {
	generateWeeklyReport,
	generateMonthlyReport,
	reportToCSV,
	reportToText
} from '$lib/server/reporting';

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

	// Get report type from URL
	const reportType = url.searchParams.get('type') || 'weekly';
	const offset = parseInt(url.searchParams.get('offset') || '0');

	let report;
	if (reportType === 'monthly') {
		report = await generateMonthlyReport(storeId, offset);
	} else {
		report = await generateWeeklyReport(storeId, offset);
	}

	return {
		store,
		report,
		reportType,
		offset
	};
};

export const actions: Actions = {
	exportCSV: async ({ params, locals }) => {
		const storeId = parseInt(params.id);

		if (!locals.user || locals.user.role !== 'owner') {
			throw error(403, 'Akses ditolak');
		}

		const report = await generateWeeklyReport(storeId, 0);
		const csv = reportToCSV(report);

		return { csv, filename: `rekap-${report.storeName}-${report.period.startDate}.csv` };
	}
};
