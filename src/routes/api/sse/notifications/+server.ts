import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { eq, or, isNull, desc } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';

// Simple in-memory event emitter for SSE
const clients = new Map<number, Set<ReadableStreamDefaultController>>();

export function notifyUser(userId: number, notification: any) {
  const userClients = clients.get(userId);
  if (userClients) {
    const data = JSON.stringify(notification);
    userClients.forEach(controller => {
      try {
        controller.enqueue(`data: ${data}\n\n`);
      } catch (e) {
        // Client disconnected
      }
    });
  }

  // Also notify broadcast listeners (userId = 0)
  const broadcastClients = clients.get(0);
  if (broadcastClients) {
    const data = JSON.stringify(notification);
    broadcastClients.forEach(controller => {
      try {
        controller.enqueue(`data: ${data}\n\n`);
      } catch (e) {
        // Client disconnected
      }
    });
  }
}

export const GET: RequestHandler = async (event) => {
  const sessionId = getSessionId(event);
  if (!sessionId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await validateSession(sessionId);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = user.id;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Register this client
      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }
      clients.get(userId)!.add(controller);

      // Send initial notifications
      db.select()
        .from(notifications)
        .where(or(
          eq(notifications.userId, userId),
          isNull(notifications.userId)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(10)
        .then(notifs => {
          const data = JSON.stringify({ type: 'init', notifications: notifs });
          try {
            controller.enqueue(`data: ${data}\n\n`);
          } catch (e) {
            // Stream closed
          }
        });

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`);
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on close
      event.request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clients.get(userId)?.delete(controller);
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};
