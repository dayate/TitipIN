// WhatsApp Integration using WAHA (WhatsApp HTTP API)
// Requires Docker: docker run -d --name waha -p 3000:3000 devlikeapro/waha

const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';

interface WAMessage {
  chatId: string;
  text: string;
}

interface WAStatus {
  connected: boolean;
  qr?: string;
}

/**
 * Check if WAHA is available and session is connected
 */
export async function getStatus(): Promise<WAStatus> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`);
    if (!res.ok) {
      return { connected: false };
    }
    const data = await res.json();
    return {
      connected: data.status === 'WORKING',
      qr: data.qr?.data,
    };
  } catch (error) {
    console.error('WAHA status check failed:', error);
    return { connected: false };
  }
}

/**
 * Start a new WhatsApp session (returns QR code for scanning)
 */
export async function startSession(): Promise<{ success: boolean; qr?: string; error?: string }> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: WAHA_SESSION }),
    });

    if (!res.ok) {
      const error = await res.text();
      return { success: false, error };
    }

    const data = await res.json();
    return { success: true, qr: data.qr?.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Send a WhatsApp message
 * @param phone - Phone number in format 628xxx (without +)
 * @param message - Text message to send
 */
export async function sendMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Normalize phone number
    let normalized = phone.replace(/[^\d]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '62' + normalized.substring(1);
    }

    const chatId = `${normalized}@c.us`;

    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        text: message,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('WhatsApp send failed:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send transaction notification to supplier
 */
export async function sendTransactionNotification(
  phone: string,
  supplierName: string,
  data: {
    totalIn: number;
    totalSold: number;
    totalPayout: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const message = `🍩 *Mak Unyil - Laporan Setoran*

Halo ${supplierName}!

📦 Total Setor: ${data.totalIn} pcs
✅ Terjual: ${data.totalSold} pcs
↩️ Sisa: ${data.totalIn - data.totalSold} pcs

💰 *Total Bayar: Rp ${data.totalPayout.toLocaleString('id-ID')}*

Terima kasih sudah setor hari ini! 🙏`;

  return sendMessage(phone, message);
}

/**
 * Send announcement/broadcast to multiple phones
 */
export async function sendBroadcast(
  phones: string[],
  title: string,
  message: string
): Promise<{ success: number; failed: number }> {
  const fullMessage = `📢 *${title}*\n\n${message}\n\n_- Mak Unyil_`;

  let success = 0;
  let failed = 0;

  for (const phone of phones) {
    const result = await sendMessage(phone, fullMessage);
    if (result.success) {
      success++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { success, failed };
}
