import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Halaman ini sudah obsolete - riwayat sekarang per-store
// Redirect ke dashboard untuk memilih lapak
export const load: PageServerLoad = async () => {
  throw redirect(302, '/app');
};
