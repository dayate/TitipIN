# Database Schema Design

## Enums

```typescript
UserRole: 'owner' | 'supplier'
UserStatus: 'pending' | 'active' | 'suspended'
MemberStatus: 'pending' | 'active' | 'suspended' | 'rejected'
ProductStatus: 'pending' | 'approved' | 'rejected'
TransactionStatus: 'draft' | 'verified' | 'completed'
```

---

## Tables

### 1. users
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto increment |
| name | text | Nama lengkap |
| whatsapp | text (unique) | Nomor WA (login ID) |
| pin_hash | text | Bcrypt hash |
| role | UserRole | `owner` atau `supplier` |
| status | UserStatus | Status akun global |
| avatar_url | text? | Foto profil |
| bio | text? | About me |
| address | text? | Alamat user |
| created_at | timestamp | |

---

### 2. stores
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| owner_id | FK → users.id | Pemilik lapak |
| name | text | Nama lapak |
| slug | text (unique) | URL friendly |
| description | text? | |
| logo_url | text? | |
| banner_url | text? | |
| is_open | boolean | Status buka/tutup |
| open_time | text | HH:MM |
| close_time | text | HH:MM |
| emergency_mode | boolean | Mode darurat |
| announcement | text? | Pengumuman |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### 3. store_branches
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| store_id | FK → stores.id | |
| name | text | Nama cabang |
| address | text | Alamat lengkap |
| phone | text? | |
| latitude | real? | Koordinat |
| longitude | real? | |
| is_main | boolean | Cabang utama |
| is_active | boolean | |
| created_at | timestamp | |

---

### 4. store_members
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| store_id | FK → stores.id | |
| user_id | FK → users.id | |
| status | MemberStatus | |
| invited_by | FK → users.id? | Jika via invite |
| request_message | text? | Pesan permohonan |
| joined_at | timestamp? | Saat disetujui |
| created_at | timestamp | |
| **UNIQUE** | (store_id, user_id) | |

---

### 5. products
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| supplier_id | FK → users.id | |
| store_id | FK → stores.id | |
| name | text | |
| description | text? | |
| image_url | text? | Foto produk |
| price_buy | integer | Harga setor |
| price_sell | integer | Harga jual |
| status | ProductStatus | Approval status |
| is_active | boolean | |
| created_at | timestamp | |

---

### 6. daily_transactions
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| date | text | YYYY-MM-DD |
| store_id | FK → stores.id | |
| branch_id | FK → store_branches.id? | |
| supplier_id | FK → users.id | |
| status | TransactionStatus | |
| total_items_in | integer | |
| total_items_sold | integer | |
| total_payout | integer | |
| admin_note | text? | |
| created_at | timestamp | |

---

### 7. transaction_items
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| trx_id | FK → daily_transactions.id | |
| product_id | FK → products.id | |
| qty_planned | integer | Input malam |
| qty_actual | integer | Validasi subuh |
| qty_returned | integer | Input pagi |

---

### 8. global_posts
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| author_id | FK → users.id | |
| title | text | |
| content | text | |
| image_url | text? | |
| is_pinned | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### 9. global_comments
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| post_id | FK → global_posts.id | |
| author_id | FK → users.id | |
| content | text | |
| created_at | timestamp | |

---

### 10. local_posts
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| store_id | FK → stores.id | |
| author_id | FK → users.id | |
| title | text | |
| content | text | |
| image_url | text? | |
| is_pinned | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### 11. local_comments
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| post_id | FK → local_posts.id | |
| author_id | FK → users.id | |
| content | text | |
| created_at | timestamp | |

---

### 12. sessions
| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Session token |
| user_id | FK → users.id | |
| expires_at | timestamp | |

---

### 13. notifications
| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | |
| user_id | FK → users.id? | null = broadcast |
| store_id | FK → stores.id? | null = global |
| type | text | info, warning, success, etc |
| title | text | |
| message | text | |
| is_read | boolean | |
| created_at | timestamp | |