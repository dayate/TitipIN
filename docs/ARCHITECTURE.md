# 🏗️ Architecture Overview

> **Project:** Mak Unyil - Konsinyasi Digital
> **Stack:** SvelteKit 5, TypeScript, SQLite/Drizzle ORM
> **Last Updated:** 7 Januari 2026

---

## 📊 System Architecture

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        Browser["Browser (SSR + CSR)"]
        SSE["SSE Connection"]
    end

    subgraph SvelteKit["⚡ SvelteKit Application"]
        Hooks["hooks.server.ts<br/>(Auth + Security Headers)"]
        Routes["+page.svelte Routes"]
        ServerLoad["+page.server.ts<br/>(Server Load)"]
        Actions["Form Actions"]
        API["API Endpoints<br/>(REST + SSE)"]
    end

    subgraph ServerLib["📦 Server Library (25 modules)"]
        Auth["auth.ts"]
        Stores["stores.ts"]
        Members["members.ts"]
        Products["products.ts"]
        Transactions["transactions.ts"]
        Notifications["notifications.ts"]
        NotifEmitter["notificationEmitter.ts (SSE)"]
        Analytics["analytics.ts"]
        Reporting["reporting.ts"]
        Audit["audit.ts"]
        Cache["cache.ts"]
        Cutoff["cutoff.ts"]
        Scheduler["scheduler.ts"]
        Reliability["reliability.ts"]
    end

    subgraph Data["💾 Data Layer"]
        Drizzle["Drizzle ORM"]
        Indexes["28 Indexes"]
        SQLite["SQLite Database<br/>(13 Tables)"]
    end

    Browser --> Hooks
    SSE --> API
    Hooks --> Routes
    Routes --> ServerLoad
    Routes --> Actions
    ServerLoad --> ServerLib
    Actions --> ServerLib
    API --> ServerLib
    ServerLib --> Drizzle
    Drizzle --> Indexes
    Indexes --> SQLite
```

---

## 📁 Directory Structure

```
src/
├── lib/
│   ├── components/          # UI Components (14 files)
│   │   ├── ui/              # shadcn-svelte base (6)
│   │   ├── ErrorBoundary.svelte
│   │   ├── LoadingSpinner.svelte
│   │   ├── LoadingStates.svelte
│   │   ├── ServerClock.svelte
│   │   ├── SetoranModal.svelte
│   │   ├── Skeleton.svelte
│   │   ├── ThemeToggle.svelte
│   │   └── index.ts
│   │
│   ├── server/              # Server-side logic (25 modules)
│   │   ├── db/              # Database (4 files)
│   │   │   ├── schema.ts    # 13 tables
│   │   │   ├── indexes.ts   # 28 indexes
│   │   │   ├── index.ts     # Connection
│   │   │   └── seed.ts      # Seeding
│   │   │
│   │   ├── auth.ts          # Authentication
│   │   ├── stores.ts        # Store CRUD
│   │   ├── members.ts       # Membership
│   │   ├── products.ts      # Products
│   │   ├── transactions.ts  # Transactions
│   │   ├── notifications.ts # Notifications
│   │   ├── notificationEmitter.ts  # SSE
│   │   ├── invites.ts       # Invite codes
│   │   ├── analytics.ts     # Dashboard
│   │   ├── reporting.ts     # Reports
│   │   ├── reliability.ts   # Supplier stats
│   │   ├── audit.ts         # Audit logging
│   │   ├── cache.ts         # In-memory cache
│   │   ├── cutoff.ts        # Cut-off logic
│   │   ├── scheduler.ts     # Scheduling
│   │   ├── storeStatus.ts   # Status history
│   │   ├── sanitize.ts      # Input sanitization
│   │   ├── rateLimit.ts     # In-memory rate limit
│   │   ├── rateLimitPersistent.ts  # SQLite rate limit
│   │   ├── featureFlags.ts  # Feature toggles
│   │   ├── imageOptimization.ts
│   │   ├── config.ts        # Config validation
│   │   ├── errors.ts        # Custom errors
│   │   ├── logger.ts        # Logging
│   │   └── index.ts         # Barrel exports
│   │
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript types (branded)
│   └── utils.ts             # Client utilities
│
├── routes/
│   ├── admin/               # Owner panel (47 files)
│   │   ├── stores/[id]/     # Per-store management
│   │   │   ├── analytics/
│   │   │   ├── audit-log/

│   │   │   ├── invite/
│   │   │   ├── members/
│   │   │   ├── products/
│   │   │   ├── reliability/
│   │   │   ├── reports/
│   │   │   ├── return/
│   │   │   ├── settings/
│   │   │   └── validation/
│   │   └── ...
│   │
│   ├── app/                 # Supplier panel (33 files)
│   │   ├── discover/
│   │   ├── history/
│   │   ├── join/
│   │   ├── notifications/
│   │   ├── products/
│   │   ├── setor/
│   │   └── stores/
│   │
│   ├── api/                 # API endpoints
│   │   ├── cron/cutoff/     # Cron webhook
│   │   ├── notifications/stream/  # SSE
│   │   ├── scheduler/
│   │   └── stores/
│   │
│   ├── auth/                # Authentication
│   │   ├── login/
│   │   ├── logout/
│   │   ├── register/
│   │   └── reset-pin/
│   │
│   └── join/                # Invite flow
│       └── [code]/
│
└── tests/                   # 11 test files (77+ tests)
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant H as hooks.server.ts
    participant A as auth.ts
    participant DB as Database

    U->>B: Enter WhatsApp + PIN
    B->>H: POST /auth/login
    H->>A: login(whatsapp, pin)
    A->>A: Check rate limit
    A->>DB: Find user by whatsapp
    DB-->>A: User record
    A->>A: Verify PIN (bcrypt)
    A->>DB: Create session
    A-->>H: Session + User
    H->>B: Set cookie (session_id)
    B-->>U: Redirect to dashboard
```

---

## 💎 Data Model

```mermaid
erDiagram
    users ||--o{ stores : owns
    users ||--o{ store_members : joins
    users ||--o{ products : supplies
    users ||--o{ daily_transactions : creates
    users ||--o{ notifications : receives
    users ||--o{ sessions : has
    users ||--o{ supplier_stats : tracked_by

    stores ||--o{ store_members : has
    stores ||--o{ store_invites : generates

    stores ||--o{ products : sells
    stores ||--o{ daily_transactions : records
    stores ||--o{ daily_store_status : logs

    daily_transactions ||--o{ transaction_items : contains
    products ||--o{ transaction_items : appears_in

    users {
        int id PK
        string name
        string whatsapp UK
        string pin_hash
        enum role
        enum status
    }

    stores {
        int id PK
        int owner_id FK
        string name
        string slug UK
        boolean is_open
        boolean emergency_mode
        string cutoff_time
    }

    store_members {
        int id PK
        int store_id FK
        int user_id FK
        enum status
        enum role
    }

    daily_transactions {
        int id PK
        string date
        int store_id FK
        int supplier_id FK
        enum status
        int total_payout
    }

    transaction_items {
        int id PK
        int trx_id FK
        int product_id FK
        int qty_planned
        int qty_actual
        int qty_returned
    }
```

---

## 🔄 Transaction Status Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: Supplier creates
    Draft --> Verified: Admin verifies qty_actual
    Draft --> Cancelled: Auto-cancel (cut-off)
    Draft --> Cancelled: Supplier cancels
    Verified --> Completed: Admin inputs qty_returned
    Verified --> Cancelled: Admin cancels
    Completed --> [*]
    Cancelled --> [*]
```

---

## 📡 Real-time Notifications (SSE)

```mermaid
sequenceDiagram
    participant C as Client
    participant S as SSE Endpoint
    participant E as notificationEmitter
    participant DB as Database

    C->>S: GET /api/notifications/stream
    S->>E: Register connection

    loop Every notification
        DB-->>E: New notification created
        E->>S: Emit to user
        S->>C: SSE Event
        C->>C: Update UI
    end
```

---

## ⚡ Performance Optimizations

| Layer | Optimization |
|-------|-------------|
| Database | 28 indexes on frequently queried columns |
| Cache | In-memory with stale-while-revalidate pattern |
| Bundle | Code splitting per route, vendor chunks |
| Images | Lazy loading, WebP conversion hints |
| Queries | Batch operations, N+1 prevention |

---

## 🔒 Security Measures

| Measure | Implementation |
|---------|---------------|
| Authentication | Bcrypt PIN hashing (cost factor 12) |
| Session | HTTP-only cookies, 30-day expiry |
| Rate Limiting | SQLite persistent + memory fallback |
| Headers | CSP, X-Frame-Options, HSTS, X-Content-Type-Options |
| Input | Zod validation, HTML sanitization |
| CSRF | SvelteKit built-in protection |

---

## 🧪 Testing Strategy

| Type | Coverage | Tool |
|------|----------|------|
| Unit Tests | 77+ tests | Vitest |
| Schema Tests | Zod validation | Vitest + Zod |
| E2E Tests | User flows | Playwright |
| Type Safety | Compile-time | TypeScript strict |

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Server Modules | 25 |
| Database Tables | 13 |
| Database Indexes | 28 |
| Route Files | 100+ |
| Test Files | 11 |
| Unit Tests | 77+ |
| Notification Types | 15 |
| Audit Actions | 12 |

---

*Architecture documentation maintained by the development team*
*Last Updated: 7 Januari 2026*
