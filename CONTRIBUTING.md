# 🤝 Contributing to Mak Unyil

Terima kasih atas minat Anda untuk berkontribusi! Dokumen ini menjelaskan panduan dan proses untuk berkontribusi ke proyek ini.

---

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Code Style Guide](#code-style-guide)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mak-unyil

# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env`:

```env
DATABASE_URL=file:./dev.db
SESSION_SECRET=your-secret-key-min-16-chars
NODE_ENV=development
```

---

## 📝 Code Style Guide

### TypeScript

- Gunakan `strict` mode
- Hindari `any`, gunakan `unknown` jika perlu
- Gunakan branded types untuk IDs (`UserId`, `StoreId`, dll)

```typescript
// ✅ Good
function getUser(id: UserId): Promise<User | null>

// ❌ Bad
function getUser(id: number): Promise<any>
```

### Svelte Components

- Gunakan Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Props dengan TypeScript interface
- ARIA labels untuk accessibility

```svelte
<script lang="ts">
  interface Props {
    title: string;
    onClick?: () => void;
  }

  let { title, onClick }: Props = $props();
</script>

<button onclick={onClick} aria-label={title}>
  {title}
</button>
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SetoranModal.svelte` |
| Utilities | camelCase | `formatCurrency.ts` |
| Routes | lowercase | `+page.svelte` |
| Tests | `.test.ts` | `schemas.test.ts` |

---

## 💬 Commit Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `docs` | Dokumentasi |
| `style` | Formatting (no code change) |
| `refactor` | Refactoring |
| `test` | Tests |
| `chore` | Maintenance |

### Examples

```bash
feat(transactions): add export to CSV
fix(auth): handle expired session redirect
docs(readme): update installation steps
```

---

## 🔀 Pull Request Process

1. **Fork & Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code style guide
   - Add tests if applicable
   - Update documentation

3. **Test**
   ```bash
   npm run check      # Type check
   npm run test:run   # Unit tests
   ```

4. **Submit PR**
   - Fill out PR template
   - Link related issues
   - Request review

---

## 🧪 Testing Guidelines

### Unit Tests

Gunakan Vitest untuk unit tests:

```typescript
import { describe, it, expect } from 'vitest';

describe('formatCurrency', () => {
  it('should format number to Rupiah', () => {
    expect(formatCurrency(10000)).toBe('Rp 10.000');
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests once
npm run test:run

# Watch mode
npm run test -- --watch
```

### Test Coverage Target

- **Unit Tests**: > 80% coverage
- **Critical Paths**: 100% coverage (auth, transactions)

---

## 📁 Issue Templates

### Bug Report

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable.

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node: [e.g. 18.x]
```

### Feature Request

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Alternatives considered**
Any alternative solutions.
```

---

## 📞 Contact

- GitHub Issues untuk bug reports
- Diskusi untuk pertanyaan umum

---

*Happy contributing!* 🎉
