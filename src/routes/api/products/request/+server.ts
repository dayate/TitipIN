import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { getSessionId, validateSession } from '$lib/server/auth';

// Supplier request new product
export const POST: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { name, priceBuy, priceSell } = await event.request.json();

    if (!name || !priceBuy || !priceSell) {
      return json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const result = db.insert(products).values({
      name,
      priceBuy,
      priceSell,
      supplierId: user.id,
      status: 'pending',
      isActive: false,
    }).returning().all();

    return json({ success: true, product: result[0] });
  } catch (error) {
    console.error('Product request error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
