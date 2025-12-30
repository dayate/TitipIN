import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

// Create product
export const POST: RequestHandler = async (event) => {
  const sessionId = getSessionId(event);
  if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateSession(sessionId);
  if (!user || user.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { name, priceBuy, priceSell, supplierId } = await event.request.json();

  const result = db.insert(products).values({
    name,
    priceBuy,
    priceSell,
    supplierId,
    isActive: true,
  }).returning().all();

  return json({ success: true, product: result[0] });
};

// Update product
export const PUT: RequestHandler = async (event) => {
  const sessionId = getSessionId(event);
  if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateSession(sessionId);
  if (!user || user.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { id, name, priceBuy, priceSell, supplierId } = await event.request.json();

  await db.update(products)
    .set({ name, priceBuy, priceSell, supplierId })
    .where(eq(products.id, id));

  return json({ success: true });
};

// Toggle active
export const PATCH: RequestHandler = async (event) => {
  const sessionId = getSessionId(event);
  if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateSession(sessionId);
  if (!user || user.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { id, isActive } = await event.request.json();

  await db.update(products)
    .set({ isActive })
    .where(eq(products.id, id));

  return json({ success: true });
};

// Delete product
export const DELETE: RequestHandler = async (event) => {
  const sessionId = getSessionId(event);
  if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateSession(sessionId);
  if (!user || user.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await event.request.json();

  await db.delete(products).where(eq(products.id, id));

  return json({ success: true });
};
