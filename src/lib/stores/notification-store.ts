import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface Notification {
  id: number;
  userId: number | null;
  type: 'info' | 'warning' | 'success' | 'product_approved' | 'product_rejected' | 'transaction';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  connected: boolean;
}

function createNotificationStore() {
  const { subscribe, set, update } = writable<NotificationState>({
    notifications: [],
    connected: false,
  });

  let eventSource: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (!browser) return;

    // Close existing connection
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource('/api/sse/notifications');

    eventSource.onopen = () => {
      update(state => ({ ...state, connected: true }));
      console.log('SSE connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          // Initial notifications
          update(state => ({
            ...state,
            notifications: data.notifications.map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            })),
          }));
        } else if (data.type === 'new') {
          // New notification
          update(state => ({
            ...state,
            notifications: [
              { ...data.notification, createdAt: new Date(data.notification.createdAt) },
              ...state.notifications,
            ],
          }));

          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(data.notification.title, {
              body: data.notification.message,
              icon: '/favicon.png',
            });
          }
        } else if (data.type === 'read') {
          // Mark as read
          update(state => ({
            ...state,
            notifications: state.notifications.map(n =>
              n.id === data.notificationId ? { ...n, isRead: true } : n
            ),
          }));
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', e);
      }
    };

    eventSource.onerror = () => {
      update(state => ({ ...state, connected: false }));
      eventSource?.close();
      eventSource = null;

      // Reconnect after 5 seconds
      reconnectTimeout = setTimeout(() => {
        connect();
      }, 5000);
    };
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    update(state => ({ ...state, connected: false }));
  }

  async function markAsRead(notificationId: number) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      update(state => ({
        ...state,
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
      }));
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      update(state => ({
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      }));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  }

  async function requestPermission() {
    if (browser && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  return {
    subscribe,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };
}

export const notificationStore = createNotificationStore();

// Derived store for unread count
export const unreadCount = derived(notificationStore, ($store) =>
  $store.notifications.filter(n => !n.isRead).length
);
