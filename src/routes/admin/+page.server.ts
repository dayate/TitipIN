import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { stores, storeMembers, products, dailyTransactions } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const load = async ({ locals }: { locals: App.Locals }) => {
	const userId = locals.user!.id;

	// Get owner's stores
	const ownerStores = await db
		.select()
		.from(stores)
		.where(eq(stores.ownerId, userId));

	const storeIds = ownerStores.map(s => s.id);

	// Get total active members across all stores
	let totalMembers = 0;
	let pendingMembers = 0;
	for (const storeId of storeIds) {
		const members = await db
			.select()
			.from(storeMembers)
			.where(eq(storeMembers.storeId, storeId));
		totalMembers += members.filter(m => m.status === 'active').length;
		pendingMembers += members.filter(m => m.status === 'pending').length;
	}

	// Get total approved products across all stores
	let totalProducts = 0;
	let pendingProducts = 0;
	for (const storeId of storeIds) {
		const prods = await db
			.select()
			.from(products)
			.where(eq(products.storeId, storeId));
		totalProducts += prods.filter(p => p.status === 'approved').length;
		pendingProducts += prods.filter(p => p.status === 'pending').length;
	}

	// Get today's transactions count
	const today = new Date().toISOString().split('T')[0];
	let todayTransactions = 0;
	let todayPendingValidation = 0;
	for (const storeId of storeIds) {
		const trx = await db
			.select()
			.from(dailyTransactions)
			.where(and(
				eq(dailyTransactions.storeId, storeId),
				eq(dailyTransactions.date, today)
			));
		todayTransactions += trx.length;
		todayPendingValidation += trx.filter(t => t.status === 'draft').length;
	}

	// Get this month's total payout (completed transactions)
	const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
	let monthlyPayout = 0;
	for (const storeId of storeIds) {
		const trx = await db
			.select()
			.from(dailyTransactions)
			.where(eq(dailyTransactions.storeId, storeId));

		monthlyPayout += trx
			.filter(t => t.date.startsWith(thisMonth) && t.status === 'completed')
			.reduce((sum, t) => sum + t.totalPayout, 0);
	}

	return {
		stats: {
			totalMembers,
			pendingMembers,
			totalProducts,
			pendingProducts,
			todayTransactions,
			todayPendingValidation,
			monthlyPayout
		},
		storeCount: ownerStores.length
	};
};
