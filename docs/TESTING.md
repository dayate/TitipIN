# 🧪 Testing Documentation

> **Framework:** Vitest 4.x + Playwright 1.57.x
> **Last Updated:** 7 Januari 2026
> **Status:** 77+ unit tests ✅ + E2E tests ✅

---

## Quick Start

```bash
# Run all unit tests once
npm run test:run

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## Test Files Overview

| File | Description | Coverage |
|------|-------------|----------|
| `rateLimit.test.ts` | Rate limiter logic | 6 tests |
| `schemas.test.ts` | Zod validation schemas | 20 tests |
| `batchQueries.test.ts` | Sanitization & batch queries | 9 tests |
| `phase2.test.ts` | Phase 2 features (audit, dates) | 12 tests |
| `phase4-7.test.ts` | Scheduler, cutoff, PDF | 15 tests |
| `sse-notifications.test.ts` | SSE real-time notifications | 15 tests |
| `perfectScore.test.ts` | Code quality (cache, flags) | 10 tests |
| `errors.test.ts` | Error handling classes | 8 tests |
| `cutoff.test.ts` | Cut-off time logic | 6 tests |
| `transactions.test.ts` | Transaction flow logic | 5 tests |
| **Total** | | **77+ tests** |

---

## Test Coverage Areas

### Foundation Tests
- ✅ Rate limiting (in-memory + persistent)
- ✅ Phone number normalization
- ✅ Zod schema validation (login, register, store, product)
- ✅ HTML escaping & XSS prevention
- ✅ Input sanitization

### Business Logic Tests
- ✅ Transaction status flow (draft → verified → completed)
- ✅ Cut-off time calculation
- ✅ Auto-cancel logic
- ✅ Payout calculation
- ✅ Supplier reliability scoring

### Infrastructure Tests
- ✅ Cache system (stale-while-revalidate)
- ✅ Feature flags
- ✅ Scheduler functions
- ✅ Scheduler functions
- ✅ Audit log JSON serialization

### Real-time Tests
- ✅ SSE connection management
- ✅ Emit to user logic
- ✅ Store state updates
- ✅ Event parsing
- ✅ Heartbeat logic

### Error Handling Tests
- ✅ Custom error classes (AppError, ValidationError, etc.)
- ✅ Error response formatting
- ✅ HTTP status codes

---

## E2E Tests (Playwright)

Location: `tests/`

```bash
# Run all E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

### E2E Coverage
- ✅ Login flow
- ✅ Registration flow
- ✅ Store creation
- ✅ Member management

---

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(invalid)).toThrow();
  });
});
```

### Schema Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { loginSchema } from '$lib/schemas';

describe('Login Schema', () => {
  it('should validate correct input', () => {
    const result = loginSchema.safeParse({
      whatsapp: '081234567890',
      pin: '123456'
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid PIN', () => {
    const result = loginSchema.safeParse({
      whatsapp: '081234567890',
      pin: '123' // Too short
    });
    expect(result.success).toBe(false);
  });
});
```

---

## Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/tests/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts']
  }
});
```

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173
  },
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:4173'
  }
});
```

---

## Troubleshooting

> [!IMPORTANT]
> Jika tests gagal dengan "No test suite found", coba:

```bash
# Clear caches
rmdir /s /q node_modules\.vite
rmdir /s /q .svelte-kit

# Reinstall
npm install

# Re-run tests
npm run test:run
```

> [!TIP]
> Untuk debugging, gunakan `it.only()` untuk fokus pada satu test:
```typescript
it.only('should debug this', () => {
  // Only this test will run
});
```

---

## Coverage Report

```bash
npm run test:coverage
```

Coverage report akan di-generate di folder `coverage/`.

---

*Documentation updated: 7 Januari 2026*
