# API Documentation

## Overview

Mak Unyil menggunakan SvelteKit's form actions untuk komunikasi client-server. Semua endpoints menggunakan POST method melalui form actions.

---

## Authentication

### POST /auth/login

Login dengan nomor WhatsApp dan PIN.

**Body:**
```
whatsapp: string (format: 08xx atau 62xx)
pin: string (6 digit)
redirect?: string (optional redirect URL)
```

**Response:**
- Success: Redirect ke `/admin` atau `/app`
- Error: `{ error: string }`

**Rate Limit:** 5 attempts per 15 minutes

---

### POST /auth/register

Registrasi user baru.

**Body:**
```
name: string
whatsapp: string
pin: string (6 digit)
confirmPin: string
role: 'owner' | 'supplier'
```

---

### POST /auth/logout

Logout user dan hapus session.

---

## Stores

### POST /admin/stores (create)

Buat lapak baru.

**Body:**
```
name: string (3-50 chars)
description?: string
visibility?: 'public' | 'private' (default: private)
```

### POST /admin/stores/[id] (update)

Update settings lapak.

**Body:**
```
name?: string
description?: string
phone?: string
address?: string
operatingDays?: string
openTime?: string (HH:MM)
closeTime?: string (HH:MM)
visibility?: 'public' | 'private'
isOpen?: boolean
autoApprove?: boolean
```

---

## Members

### POST /admin/stores/[id]/members?/approve

Approve join request.

**Body:**
```
memberId: number
```

### POST /admin/stores/[id]/members?/reject

Reject join request.

**Body:**
```
memberId: number
reason?: string
```

### POST /admin/stores/[id]/members?/kick

Kick member dari lapak.

**Body:**
```
memberId: number
```

---

## Invite Codes

### POST /admin/stores/[id]/invite?/create

Buat kode undangan baru.

**Body:**
```
maxUses?: number (default: unlimited)
expiresInDays?: number (default: 7)
```

**Response:**
```
{ code: string }
```

---

## Transactions

### POST /admin/stores/[id]/transactions?/create

Buat transaksi baru (draft).

### POST /admin/stores/[id]/transactions/[txId]?/verify

Verifikasi transaksi (update qty_actual).

### POST /admin/stores/[id]/transactions/[txId]?/complete

Complete transaksi (update qty_returned, calculate payout).

---

## Notifications

### POST /app/notifications?/markAsRead

Tandai notifikasi sebagai sudah dibaca.

**Body:**
```
notificationId: number
```

### POST /app/notifications?/markAllAsRead

Tandai semua notifikasi sebagai sudah dibaca.

---

## Data Types

### User
```typescript
{
  id: number
  name: string
  whatsapp: string
  role: 'owner' | 'supplier'
  createdAt: Date
}
```

### Store
```typescript
{
  id: number
  ownerId: number
  name: string
  slug: string
  description?: string
  visibility: 'public' | 'private'
  isOpen: boolean
  autoApprove: boolean
  operatingDays?: string
  openTime?: string
  closeTime?: string
}
```

### StoreMember
```typescript
{
  id: number
  storeId: number
  userId: number
  status: 'pending' | 'active' | 'rejected' | 'leaving' | 'suspended'
  inviteCodeUsed?: string
  joinedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}
```

### Notification
```typescript
{
  id: number
  userId: number
  type: string
  title: string
  message: string
  detailUrl?: string
  isRead: boolean
  createdAt: Date
}
```

---

## Error Responses

Semua error mengembalikan objek dengan struktur:

```typescript
{
  error: string // Pesan error dalam Bahasa Indonesia
}
```

Status codes:
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `429` - Rate limited
- `500` - Server error
