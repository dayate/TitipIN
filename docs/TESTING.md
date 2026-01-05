# 🧪 Testing Documentation

> **Framework:** Vitest v4.0.16
> **Last Updated:** 5 Januari 2026
> **Status:** 47 tests passing ✅

---

## Quick Start

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test
```

---

## Test Files

| File | Description | Tests |
|------|-------------|-------|
| `rateLimit.test.ts` | Rate limiter logic | 6 |
| `schemas.test.ts` | Zod validation schemas | 20 |
| `batchQueries.test.ts` | Sanitization & batch | 9 |
| `phase2.test.ts` | Phase 2 features | 12 |
| **Total** | | **47** |

---

## Test Coverage

### Phase 0-1 Tests
- ✅ Rate limiting logic
- ✅ Phone number normalization
- ✅ Zod schema validation (login, register, store)
- ✅ HTML escaping & sanitization

### Phase 2 Tests
- ✅ Audit log JSON serialization
- ✅ Cut-off time calculation
- ✅ Date utilities (getTodayDate)
- ✅ Store status tracking

---

## Troubleshooting

> [!IMPORTANT]
> Jika tests gagal dengan "No test suite found", coba:

```bash
# Clear caches and restart
rmdir /s /q node_modules\.vite
rmdir /s /q .svelte-kit

# Re-run tests dari terminal baru
npm run test:run
```

---

## Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```
