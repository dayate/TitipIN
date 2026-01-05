# 🏗️ Architecture Overview

> **Project:** Mak Unyil - Konsinyasi Digital
> **Stack:** SvelteKit 5, TypeScript, SQLite/Drizzle ORM

---

## 📊 System Architecture

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        Browser["Browser (SSR + CSR)"]
    end

    subgraph SvelteKit["⚡ SvelteKit Application"]
        Hooks["hooks.server.ts<br/>(Auth + Security Headers)"]
        Routes["Routes (+page.svelte)"]
        ServerLoad["+page.server.ts<br/>(Server Load)"]
        Actions["Form Actions"]
    end

    subgraph ServerLib["📦 Server Library"]
        Auth["auth.ts"]
        Stores["stores.ts"]
        Members["members.ts"]
        Products["products.ts"]
        Transactions["transactions.ts"]
        Notifications["notifications.ts"]
        Analytics["analytics.ts"]
        Audit["audit.ts"]
        Cache["cache.ts"]
    end

    subgraph Data["💾 Data Layer"]
        Drizzle["Drizzle ORM"]
        SQLite["SQLite Database"]
    end

    Browser --> Hooks
    Hooks --> Routes
    Routes --> ServerLoad
    Routes --> Actions
    ServerLoad --> ServerLib
    Actions --> ServerLib
    ServerLib --> Drizzle
    Drizzle --> SQLite
```

---

## 📁 Directory Structure

```
src/
├── lib/
│   ├── components/          # UI Components
│   │   ├── ui/              # shadcn-svelte base
│   │   ├── Skeleton.svelte  # Loading states
│   │   ├── ErrorBoundary.svelte
│   │   └── index.ts         # Barrel exports
│   │
│   ├── server/              # Server-side logic
│   │   ├── db/              # Database schema & indexes
│   │   ├── auth.ts          # Authentication
│   │   ├── stores.ts        # Store management
│   │   ├── transactions.ts  # Transaction CRUD
│   │   ├── cache.ts         # In-memory caching
│   │   ├── featureFlags.ts  # Feature toggles
│   │   └── index.ts         # Barrel exports
│   │
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript types (branded)
│   └── utils.ts             # Client utilities
│
├── routes/
│   ├── admin/               # Owner panel
│   ├── app/                 # Supplier panel
│   ├── auth/                # Authentication pages
│   └── join/                # Invite flow
│
└── tests/                   # Vitest unit tests
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

    stores ||--o{ store_members : has
    stores ||--o{ products : sells
    stores ||--o{ daily_transactions : records
    stores ||--o{ store_invites : generates

    daily_transactions ||--o{ transaction_items : contains
    products ||--o{ transaction_items : appears_in

    users {
        int id PK
        string name
        string whatsapp UK
        string pin_hash
        enum role
    }

    stores {
        int id PK
        int owner_id FK
        string name
        string slug UK
        boolean is_open
    }

    daily_transactions {
        int id PK
        string date
        int store_id FK
        int supplier_id FK
        enum status
    }
```

---

## 🔄 Transaction Status Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: Supplier creates
    Draft --> Verified: Admin verifies qty
    Draft --> Cancelled: Supplier cancels
    Verified --> Completed: End of day
    Verified --> Cancelled: Admin cancels
    Completed --> [*]
    Cancelled --> [*]
```

---

## ⚡ Performance Optimizations

| Layer | Optimization |
|-------|-------------|
| Database | 28 indexes on frequently queried columns |
| Cache | In-memory with stale-while-revalidate |
| Bundle | Code splitting per route, vendor chunks |
| Images | Lazy loading, WebP conversion hints |

---

## 🔒 Security Measures

| Measure | Implementation |
|---------|---------------|
| Authentication | Bcrypt PIN hashing |
| Session | HTTP-only cookies, 30-day expiry |
| Headers | CSP, X-Frame-Options, HSTS |
| Input | Zod validation, HTML sanitization |
| Rate Limiting | Login attempt limits (persistent) |

---

## 🧪 Testing Strategy

| Type | Coverage | Tool |
|------|----------|------|
| Unit Tests | Core logic | Vitest |
| Schema Tests | Validation | Vitest + Zod |
| Type Safety | Compile-time | TypeScript strict |

---

*Documentation maintained by the development team*
