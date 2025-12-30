# Technology Stack & Architecture

## 1. Application Layer
- **Framework:** SvelteKit (Fullstack SSR)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn-svelte components
- **State Management:** Svelte 5 Runes ($state, $derived)
- **Icons:** Lucide Svelte

## 2. Data Layer
- **Database:** SQLite (development) / PostgreSQL (production)
- **ORM:** Drizzle ORM (Type-safe, lightweight)
- **Migration:** Drizzle Kit

## 3. File Storage
- **Development:** Local storage (`/static/uploads/`)
- **Production:** Cloud storage (Cloudflare R2 / AWS S3)
- **Allowed types:** jpg, jpeg, png, webp
- **Max size:** 2MB

## 4. Infrastructure & DevOps
- **Environment:** Docker & Docker Compose
- **Hosting:** VPS (Ubuntu Server)
- **Reverse Proxy:** Nginx / Caddy (SSL)

## 5. Integrations
- **WhatsApp Gateway:** WAHA (self-hosted Docker)
- **Printer (Future):** Web Bluetooth API / ESC-POS

## 6. Project Structure

```
/src
  /lib
    /server
      /db (schema, index)
      auth.ts
      whatsapp.ts
    /components
      /ui (shadcn components)
      ThemeToggle.svelte
    /stores
    /utils
  /routes
    /auth (login, register, forgot-pin)
    /app (supplier area)
      /[storeId] (per-store context)
    /owner (owner area)
      /[storeId] (per-store context)
    /stores (public explore)
    /community (global community)
    /api (internal endpoints)
```

## 7. URL Structure

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page |
| `/auth/*` | Public | Authentication |
| `/stores` | Public | Explore lapak |
| `/stores/[slug]` | Public | Detail lapak |
| `/community` | Logged in | Global community |
| `/app` | Supplier | Supplier dashboard |
| `/app/[storeId]/*` | Supplier+Member | Per-store supplier area |
| `/owner` | Owner | Owner dashboard |
| `/owner/[storeId]/*` | Owner | Per-store admin area |