import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

// Admin approve product
export const POST: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { productId, action } = await event.request.json();

    if (action === 'approve') {
      await db.update(products)
        .set({ status: 'approved', isActive: true })
        .where(eq(products.id, productId));
    } else if (action === 'reject') {
      await db.update(products)
        .set({ status: 'rejected' })
        .where(eq(products.id, productId));
    }

    return json({ success: true });
  } catch (error) {
    console.error('Product approve error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
