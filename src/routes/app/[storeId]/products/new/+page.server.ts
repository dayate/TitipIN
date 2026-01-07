import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import { createProduct } from '$lib/server/products';
import { createNotification } from '$lib/server/notifications';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

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

	return { store };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.storeId);
		const store = await getStoreById(storeId);

		if (!store) {
			return fail(404, { error: 'Lapak tidak ditemukan' });
		}

		const data = await request.formData();

		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const priceBuy = parseInt(data.get('priceBuy')?.toString() || '0');
		const suggestedPrice = parseInt(data.get('suggestedPrice')?.toString() || '0') || undefined;
		const imageFile = data.get('image') as File | null;

		// Validation
		if (!name || name.length < 3) {
			return fail(400, { error: 'Nama produk minimal 3 karakter' });
		}

		if (name.length > 100) {
			return fail(400, { error: 'Nama produk maksimal 100 karakter' });
		}

		if (priceBuy <= 0) {
			return fail(400, { error: 'Harga setor harus lebih dari 0' });
		}

		// Handle image upload
		let imageUrl: string | undefined;
		if (imageFile && imageFile.size > 0) {
			if (imageFile.size > 5 * 1024 * 1024) {
				return fail(400, { error: 'Ukuran gambar maksimal 5MB' });
			}

			const ext = imageFile.name.split('.').pop()?.toLowerCase();
			if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
				return fail(400, { error: 'Format gambar harus JPG, PNG, atau WEBP' });
			}

			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
			const uploadDir = join(process.cwd(), 'static', 'uploads', 'products');

			if (!existsSync(uploadDir)) {
				mkdirSync(uploadDir, { recursive: true });
			}

			const filePath = join(uploadDir, fileName);
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			writeFileSync(filePath, buffer);

			imageUrl = `/uploads/products/${fileName}`;
		}

		try {
			const product = await createProduct({
				supplierId: locals.user.id,
				storeId,
				name,
				description: description || undefined,
				imageUrl,
				priceBuy,
				priceSell: 0, // Will be set by admin during approval
				suggestedPriceSell: suggestedPrice
			});

			// Notify admin about new product
			await createNotification({
				userId: store.ownerId,
				type: 'info',
				title: 'Produk Baru Menunggu Approval',
				message: `${locals.user.name} mendaftarkan produk "${name}" di lapak ${store.name}. Mohon review dan tentukan harga jual.`,
				detailUrl: `/admin/stores/${storeId}/products`,
				relatedStoreId: storeId
			});

			throw redirect(302, `/app/${storeId}/products`);
		} catch (err: any) {
			if (err.status === 302) throw err;
			console.error('Create product error:', err);
			return fail(500, { error: 'Gagal menambahkan produk, silakan coba lagi' });
		}
	}
};
