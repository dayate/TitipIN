import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { isActiveMember } from '$lib/server/members';
import { getProductById, updateProduct } from '$lib/server/products';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const storeId = parseInt(params.storeId);
	const productId = parseInt(params.id);

	const store = await getStoreById(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	const isMember = await isActiveMember(locals.user.id, storeId);
	if (!isMember) {
		throw error(403, 'Anda bukan anggota aktif lapak ini');
	}

	const product = await getProductById(productId);
	if (!product || product.supplierId !== locals.user.id || product.storeId !== storeId) {
		throw error(404, 'Produk tidak ditemukan');
	}

	return { store, product };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.storeId);
		const productId = parseInt(params.id);

		const product = await getProductById(productId);
		if (!product || product.supplierId !== locals.user.id || product.storeId !== storeId) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk mengedit produk ini' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const priceBuy = parseInt(data.get('priceBuy')?.toString() || '0');
		const suggestedPrice = parseInt(data.get('suggestedPrice')?.toString() || '0') || null;
		const imageFile = data.get('image') as File | null;

		if (!name || name.length < 3) {
			return fail(400, { error: 'Nama produk minimal 3 karakter' });
		}

		if (priceBuy <= 0) {
			return fail(400, { error: 'Harga setor harus lebih dari 0' });
		}

		// Handle image upload
		let imageUrl: string | undefined = product.imageUrl || undefined;
		if (imageFile && imageFile.size > 0) {
			if (imageFile.size > 5 * 1024 * 1024) {
				return fail(400, { error: 'Ukuran gambar maksimal 5MB' });
			}

			const ext = imageFile.name.split('.').pop()?.toLowerCase();
			if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
				return fail(400, { error: 'Format gambar harus JPG, PNG, atau WEBP' });
			}

			// Delete old image if exists
			if (product.imageUrl) {
				const oldPath = join(process.cwd(), 'static', product.imageUrl);
				if (existsSync(oldPath)) {
					try { unlinkSync(oldPath); } catch {}
				}
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

		await updateProduct(productId, {
			name,
			description: description || undefined,
			priceBuy,
			imageUrl,
			suggestedPriceSell: suggestedPrice,
			status: 'pending' // Reset to pending after edit
		});

		throw redirect(302, `/app/${storeId}/products`);
	}
};
