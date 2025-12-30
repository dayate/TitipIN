import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionId, validateSession } from '$lib/server/auth';
import { sendMessage, sendBroadcast, getStatus, startSession } from '$lib/server/whatsapp';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Get WhatsApp status
export const GET: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = await getStatus();
    return json(status);
  } catch (error) {
    console.error('WhatsApp status error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

// Send WhatsApp message
export const POST: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) return json({ error: 'Unauthorized' }, { status: 401 });

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await event.request.json();
    const { action, phone, message, title, broadcast } = body;

    if (action === 'start') {
      // Start WhatsApp session
      const result = await startSession();
      return json(result);
    }

    if (action === 'send') {
      // Send single message
      if (!phone || !message) {
        return json({ error: 'Phone and message required' }, { status: 400 });
      }
      const result = await sendMessage(phone, message);
      return json(result);
    }

    if (action === 'broadcast') {
      // Send broadcast to all suppliers
      if (!title || !message) {
        return json({ error: 'Title and message required' }, { status: 400 });
      }

      // Get all active suppliers
      const suppliers = await db
        .select({ whatsapp: users.whatsapp })
        .from(users)
        .where(eq(users.role, 'supplier'));

      const phones = suppliers.map(s => s.whatsapp).filter(Boolean);

      if (phones.length === 0) {
        return json({ success: 0, failed: 0, message: 'No suppliers found' });
      }

      const result = await sendBroadcast(phones as string[], title, message);
      return json({ ...result, total: phones.length });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
