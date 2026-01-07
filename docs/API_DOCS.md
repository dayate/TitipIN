# API Documentation

> **Last Updated:** 7 Januari 2026
> **Framework:** SvelteKit Form Actions + REST API

## Overview

Mak Unyil menggunakan kombinasi SvelteKit form actions untuk CRUD operations dan REST API untuk real-time features. Semua form actions menggunakan POST method.

---

## Authentication

### POST /auth/login

Login dengan nomor WhatsApp dan PIN.

**Body:**
```typescript
{
  whatsapp: string  // Format: 08xx atau 62xx
  pin: string       // 6 digit
  redirect?: string // Optional redirect URL
}
```

**Response:**
- Success: Redirect ke `/admin` atau `/app`
- Error: `{ error: string }`

**Rate Limit:** 5 attempts per 15 minutes (persistent)

---

### POST /auth/register

Registrasi user baru.

**Body:**
```typescript
{
  name: string       // 3-50 chars
  whatsapp: string   // Format: 08xx atau 62xx
  pin: string        // 6 digit
  confirmPin: string // Must match pin
  role: 'owner' | 'supplier'
}
```

---

### POST /auth/logout

Logout user dan hapus session.

---

### POST /auth/reset-pin

Reset PIN untuk user yang sudah login.

**Body:**
```typescript
{
  currentPin: string // 6 digit
  newPin: string     // 6 digit
  confirmPin: string // Must match newPin
}
```

---

## Stores

### POST /admin/stores?/create

Buat lapak baru.

**Body:**
```typescript
{
  name: string           // 3-50 chars
  description?: string
  visibility?: 'public' | 'private'  // default: private
}
```

### POST /admin/stores/[id]/settings (actions)

Update settings lapak.

**Actions:**
- `?/update` - Update store settings
- `?/toggleOpen` - Toggle buka/tutup
- `?/toggleEmergency` - Toggle emergency mode

**Body (update):**
```typescript
{
  name?: string
  description?: string
  phone?: string
  address?: string
  operatingDays?: string
  openTime?: string      // HH:MM
  closeTime?: string     // HH:MM
  cutoffTime?: string    // HH:MM
  visibility?: 'public' | 'private'
  isOpen?: boolean
  autoApprove?: boolean
  autoCancelEnabled?: boolean
  cutoffGracePeriod?: number  // Minutes
}
```

---

## Members

### POST /admin/stores/[id]/members

**Actions:**
- `?/approve` - Approve join request
- `?/reject` - Reject join request
- `?/kick` - Kick member
- `?/promoteAdmin` - Promote to admin
- `?/demoteAdmin` - Demote from admin
- `?/approveLeave` - Approve leave request

**Body (approve/reject/kick):**
```typescript
{
  memberId: number
  reason?: string  // For reject only
}
```

---

## Invite Codes

### POST /admin/stores/[id]/invite

**Actions:**
- `?/create` - Create new invite code
- `?/revoke` - Revoke invite code

**Body (create):**
```typescript
{
  maxUses?: number      // 0 = unlimited
  expiresInDays?: number  // default: 7
}
```

**Response (create):**
```typescript
{
  code: string  // e.g. "ABC123XY"
}
```

---

## Products

### POST /admin/stores/[id]/products

**Actions:**
- `?/approve` - Approve product
- `?/reject` - Reject product
- `?/toggleActive` - Toggle product active status
- `?/updatePrice` - Update selling price

**Body (approve/reject):**
```typescript
{
  productId: number
  priceSell?: number  // For approve
  reason?: string     // For reject
}
```

### POST /app/products

**Actions:**
- `?/create` - Create new product
- `?/update` - Update product
- `?/delete` - Delete product

**Body (create):**
```typescript
{
  storeId: number
  name: string
  description?: string
  priceBuy: number
  suggestedPriceSell?: number
  image?: File
}
```

---

## Transactions

### POST /admin/stores/[id]/validation

**Actions:**
- `?/verify` - Verify transaction (set qty_actual)
- `?/cancel` - Cancel transaction

**Body (verify):**
```typescript
{
  transactionId: number
  items: Array<{
    itemId: number
    qtyActual: number
  }>
  adminNote?: string
}
```

### POST /admin/stores/[id]/return

**Actions:**
- `?/complete` - Complete transaction (set qty_returned)

**Body (complete):**
```typescript
{
  transactionId: number
  items: Array<{
    itemId: number
    qtyReturned: number
  }>
}
```

### POST /app/setor

**Actions:**
- `?/createDraft` - Create draft transaction
- `?/updateDraft` - Update draft
- `?/cancelDraft` - Cancel draft

**Body (createDraft):**
```typescript
{
  storeId: number
  date: string  // YYYY-MM-DD
  items: Array<{
    productId: number
    qtyPlanned: number
  }>
}
```

---

## Notifications

### POST /app/notifications

**Actions:**
- `?/markAsRead` - Mark notification as read
- `?/markAllAsRead` - Mark all as read

**Body (markAsRead):**
```typescript
{
  notificationId: number
}
```

### GET /api/notifications/stream

SSE endpoint untuk real-time notifications.

**Headers:**
```
Accept: text/event-stream
Cookie: session_id=...
```

**Events:**
```typescript
// New notification
data: {
  type: 'notification',
  payload: Notification
}

// Heartbeat (every 30s)
data: { type: 'ping' }
```

---

## REST API Endpoints

### GET /api/stores

List all public stores.

**Response:**
```typescript
{
  stores: Array<{
    id: number
    name: string
    slug: string
    description?: string
    memberCount: number
    isOpen: boolean
  }>
}
```

### GET /api/stores/[slug]

Get store details by slug.

### POST /api/cron/cutoff

Process cut-off for all stores (protected).

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

---

## Data Types

### User
```typescript
{
  id: number
  name: string
  whatsapp: string
  role: 'owner' | 'supplier'
  status: 'pending' | 'active' | 'suspended'
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
  emergencyMode: boolean
  autoApprove: boolean
  cutoffTime?: string
  autoCancelEnabled: boolean
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
  role: 'member' | 'admin'
  inviteCodeUsed?: string
  joinedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}
```

### Product
```typescript
{
  id: number
  supplierId: number
  storeId: number
  name: string
  description?: string
  imageUrl?: string
  priceBuy: number
  priceSell: number
  suggestedPriceSell?: number
  status: 'pending' | 'approved' | 'rejected'
  isActive: boolean
}
```

### DailyTransaction
```typescript
{
  id: number
  date: string  // YYYY-MM-DD
  storeId: number
  supplierId: number
  status: 'draft' | 'verified' | 'completed' | 'cancelled'
  totalItemsIn: number
  totalItemsSold: number
  totalPayout: number
  adminNote?: string
  notePhotoUrl?: string
}
```

### Notification
```typescript
{
  id: number
  userId: number
  type: NotificationType  // 15 types
  title: string
  message: string
  detailUrl?: string
  relatedStoreId?: number
  isRead: boolean
  createdAt: Date
}
```

### NotificationType
```typescript
type NotificationType =
  | 'join_request'
  | 'join_approved'
  | 'join_rejected'
  | 'member_kicked'
  | 'leave_request'
  | 'leave_approved'
  | 'product_approved'
  | 'product_rejected'
  | 'transaction_verified'
  | 'transaction_completed'
  | 'transaction_cancelled'
  | 'store_closed'
  | 'cutoff_warning'
  | 'info'
  | 'system';
```

---

## Error Responses

Semua error mengembalikan objek dengan struktur:

```typescript
{
  error: string  // Pesan error dalam Bahasa Indonesia
}
```

**Status Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `429` - Rate limited
- `500` - Server error

---

*API Documentation updated: 7 Januari 2026*
