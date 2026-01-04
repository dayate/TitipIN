# 🔥 Code Review & Roasting: Mak Unyil

> **Reviewer:** AI Code Reviewer
> **Date:** 4 Januari 2026
> **Severity Scale:** 🟢 Good | 🟡 Needs Work | 🔴 Critical

---

## 📊 Overall Score

| Aspect | Score | Grade |
|--------|-------|-------|
| Code Organization | 8/10 | A- |
| Type Safety | 7/10 | B |
| UI/UX Design | 8/10 | A- |
| Performance | 6/10 | C+ |
| Security | 6/10 | C |
| Maintainability | 7/10 | B |
| Documentation | 5/10 | D |
| **OVERALL** | **6.7/10** | **C+** |

---

## 🔥 The Roasting Section

### 1. "Database Schema Flex tapi Gak Dipake" 🟡

```typescript
// Di DATABASE_SCHEMA.md disebutin ada tabel:
// - global_posts
// - global_comments
// - local_posts
// - local_comments

// Reality di schema.ts:
// ...those tables don't exist 💀
```

**Roast:** Dokumentasinya bilang ada fitur Community, tapi kodenya kayak ghosting! Schema dibuat tapi gak ada implementasi sama sekali. Ini classic case of "documentation driven development" yang kebablasan.

**Fix:** Either hapus dari docs, atau implementasi sekalian. Jangan kasih harapan palsu ke user.

---

### 2. "Error Handling? What's That?" 🔴

```typescript
// Contoh dari stores.ts
export async function deleteStore(storeId: number): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, storeId));
    return true;  // Always true? What if delete fails? 🤡
}
```

**Roast:** Return `true` tanpa cek apakah delete berhasil? Ini optimisme level dewa. Error bisa terjadi karena constraint violation, connection issue, dll. Tapi code ini bilang "pasti berhasil!" dengan confidence yang gak warranted.

**Fix:**
```typescript
const result = await db.delete(stores).where(eq(stores.id, storeId));
return result.changes > 0; // Actually check if something was deleted
```

---

### 3. "N+1 Query Party" 🔴

```typescript
// Di stores/+page.server.ts
const discoverStores = await Promise.all(
    discoverStoresRaw.map(async (store) => {
        const members = await getActiveMembers(store.id); // Query per store! 🎉
        return { ...store, memberCount: members.length };
    })
);
```

**Roast:** Bro really said "let me make one database query for EACH store" 😭. Kalau ada 100 lapak publik, ini jadi 100+ queries. Database admin lagi menangis di pojokan.

**Fix:** Use a single aggregate query:
```typescript
const memberCounts = await db
    .select({ storeId: storeMembers.storeId, count: count() })
    .from(storeMembers)
    .where(eq(storeMembers.status, 'active'))
    .groupBy(storeMembers.storeId);
```

---

### 4. "Image Upload to... Local Folder?" 🔴

**Roast:** File upload disimpan di local filesystem. Ini fine untuk development, tapi saat deploy ke serverless (Vercel, Cloudflare), semua file akan HILANG setiap redeploy. RIP user photos! 📸💀

**Fix:** Implement cloud storage (Cloudflare R2, AWS S3, atau minimal Supabase Storage) sebelum production.

---

### 5. "TypeScript, tapi Make It Optional" 🟡

```typescript
// Banyak tempat yang masih pake:
const data = form?.get('field')?.toString() || '';
const id = parseInt(value || '0');
storeData?.autoApprove || false

// Padahal bisa pake proper typing dengan:
// - Zod validation
// - Type guards
// - Proper form schemas
```

**Roast:** TypeScript dipake tapi safety-nya dikurangin pake optional chaining dan fallbacks di mana-mana. Ini kayak pake sabuk pengaman tapi gak dikancing. 🚗

**Fix:** Implementasi proper form validation dengan Zod atau Valibot. Parse once, use safely.

---

### 6. "CSS Emergency Room" 🟡

```html
<!-- Class soup alert! -->
<div class="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-auto
    sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-h-[70vh] sm:max-h-96
    overflow-hidden rounded-xl border border-border bg-card shadow-xl">
```

**Roast:** Tailwind ini enak dipake, tapi kalau udah jadi class soup kayak gini, readability jadi korban. Ini bukan programming, ini word salad. 🥗

**Fix:** Extract to reusable components atau gunakan `@apply` untuk common patterns:
```css
.dropdown-responsive {
    @apply fixed inset-x-4 top-16 z-50
           sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2;
}
```

---

### 7. "Security? We Have PIN!" 🔴

**Current Auth Flow:**
1. User enters WhatsApp number
2. User enters 6-digit PIN
3. ...that's it?

**Roast:** No OTP verification? No rate limiting? No 2FA? Siapapun yang tau nomor WA dan bisa brute-force 6 digit PIN (cuma 1 juta kombinasi!) bisa masuk. Security level: password123 🔓

**Missing:**
- OTP verification via WhatsApp
- Rate limiting on login attempts
- Session fingerprinting
- CSRF protection (though SvelteKit helps here)

---

### 8. "Test? What Test?" 🔴

```
📁 __tests__/
   └── (empty)

📁 tests/
   └── (doesn't exist)

package.json:
   "test": "vitest"
   // Last run: never 💀
```

**Roast:** Vitest sudah di-setup tapi test files nya kemana? Ini kayak punya gym membership tapi gak pernah dateng. 🏋️

**Fix:** At minimum, add tests for:
- Auth functions (critical path)
- Transaction calculations
- Member approval logic

---

## 💚 What's Actually Good

### 1. Clean File Organization ✅
Struktur folder sangat rapi dengan pemisahan yang jelas antara server logic, components, dan routes.

### 2. Consistent UI ✅
shadcn-svelte digunakan dengan baik, memberikan look & feel yang konsisten dan modern.

### 3. Type-Safe Database ✅
Drizzle ORM memberikan type safety yang bagus untuk database operations.

### 4. SvelteKit 5 Adoption ✅
Penggunaan Svelte 5 runes ($state, $derived, $props) sudah tepat dan modern.

### 5. Mobile-First Responsive ✅
Sidebar collapsible, mobile menu, dan responsive dropdowns sudah dihandle dengan baik.

---

## 📋 Prioritized Improvement Checklist

### Critical (Harus Sebelum Production) 🔴
- [ ] Implement cloud storage untuk file uploads
- [ ] Add rate limiting pada login
- [ ] Fix N+1 query issues
- [ ] Add proper error handling
- [ ] Implement OTP verification

### High Priority 🟡
- [ ] Add form validation dengan Zod
- [ ] Write unit tests untuk critical paths
- [ ] Implement proper logging
- [ ] Add loading states yang konsisten
- [ ] Setup proper environment config

### Nice to Have 🟢
- [ ] Refactor Tailwind class soup
- [ ] Add E2E tests dengan Playwright
- [ ] Implement caching strategy
- [ ] Add API documentation
- [ ] Performance optimization

---

## 🎯 Final Verdict

**Project ini LAYAK untuk MVP/beta testing**, dengan catatan:

1. **JANGAN deploy ke production** sebelum security fixes
2. Performance issues akan muncul saat data membesar
3. Dokumentasi internal perlu diperbaiki

**Potential:** 8/10 🌟 - Dengan perbaikan yang tepat, ini bisa jadi produk yang solid.

**Current State:** 6/10 - Masih banyak technical debt yang perlu dibayar.

---

> *"Kode ini kayak nasi goreng: ingredientnya bagus semua, tapi eksekusinya masih perlu latihan."*
> — AI Reviewer, 2026

---

*Roasting ini dibuat dengan tujuan konstruktif. Semua kritik bertujuan untuk meningkatkan kualitas kode, bukan menghina developer.* 🙏
