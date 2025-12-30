import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS (using text with type constraints)
// ============================================

export type UserRole = 'owner' | 'supplier';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type MemberStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type TransactionStatus = 'draft' | 'verified' | 'completed';
export type NotificationType = 'info' | 'warning' | 'success' | 'product_approved' | 'product_rejected' | 'transaction';
export type PinResetStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// ============================================
// TABLES
// ============================================

// 1. Users Table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  whatsapp: text('whatsapp').notNull().unique(),
  pinHash: text('pin_hash').notNull(),
  role: text('role').$type<UserRole>().default('supplier').notNull(),
  status: text('status').$type<UserStatus>().default('pending').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  address: text('address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 2. Stores Table (Lapak)
export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  inviteCode: text('invite_code').unique(), // Kode invite untuk join lapak
  isOpen: integer('is_open', { mode: 'boolean' }).default(false).notNull(),
  openTime: text('open_time').default('05:00'),
  closeTime: text('close_time').default('10:00'),
  emergencyMode: integer('emergency_mode', { mode: 'boolean' }).default(false).notNull(),
  announcement: text('announcement'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 3. Store Branches Table (Cabang Lapak)
export const storeBranches = sqliteTable('store_branches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  isMain: integer('is_main', { mode: 'boolean' }).default(false).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 4. Store Members Table (Anggota Lapak)
export const storeMembers = sqliteTable('store_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').$type<MemberStatus>().default('pending').notNull(),
  invitedBy: integer('invited_by').references(() => users.id),
  requestMessage: text('request_message'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  uniqueMember: uniqueIndex('unique_store_member').on(table.storeId, table.userId),
}));

// 5. Products Table
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  supplierId: integer('supplier_id').notNull().references(() => users.id),
  storeId: integer('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  priceBuy: integer('price_buy').notNull(),
  priceSell: integer('price_sell').notNull(),
  status: text('status').$type<ProductStatus>().default('pending').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 6. Daily Transactions Table (Header)
export const dailyTransactions = sqliteTable('daily_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  storeId: integer('store_id').notNull().references(() => stores.id),
  branchId: integer('branch_id').references(() => storeBranches.id),
  supplierId: integer('supplier_id').notNull().references(() => users.id),
  status: text('status').$type<TransactionStatus>().default('draft').notNull(),
  totalItemsIn: integer('total_items_in').default(0).notNull(),
  totalItemsSold: integer('total_items_sold').default(0).notNull(),
  totalPayout: integer('total_payout').default(0).notNull(),
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 7. Transaction Items Table (Detail)
export const transactionItems = sqliteTable('transaction_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trxId: integer('trx_id').notNull().references(() => dailyTransactions.id),
  productId: integer('product_id').notNull().references(() => products.id),
  qtyPlanned: integer('qty_planned').default(0).notNull(),
  qtyActual: integer('qty_actual').default(0).notNull(),
  qtyReturned: integer('qty_returned').default(0).notNull(),
});

// 8. Sessions Table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

// 9. Notifications Table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  storeId: integer('store_id').references(() => stores.id),
  type: text('type').$type<NotificationType>().default('info').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 10. PIN Reset Requests Table
export const pinResetRequests = sqliteTable('pin_reset_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').$type<PinResetStatus>().default('pending').notNull(),
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  processedAt: integer('processed_at', { mode: 'timestamp' }),
});

// 11. Global Posts Table (Komunitas Besar)
export const globalPosts = sqliteTable('global_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 12. Global Comments Table
export const globalComments = sqliteTable('global_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => globalPosts.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 13. Local Posts Table (Komunitas Lapak)
export const localPosts = sqliteTable('local_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 14. Local Comments Table
export const localComments = sqliteTable('local_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => localPosts.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  ownedStores: many(stores),
  memberships: many(storeMembers),
  products: many(products),
  transactions: many(dailyTransactions),
  sessions: many(sessions),
  globalPosts: many(globalPosts),
  localPosts: many(localPosts),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  branches: many(storeBranches),
  members: many(storeMembers),
  products: many(products),
  transactions: many(dailyTransactions),
  localPosts: many(localPosts),
}));

export const storeBranchesRelations = relations(storeBranches, ({ one }) => ({
  store: one(stores, {
    fields: [storeBranches.storeId],
    references: [stores.id],
  }),
}));

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
  store: one(stores, {
    fields: [storeMembers.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [storeMembers.invitedBy],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  supplier: one(users, {
    fields: [products.supplierId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

export const dailyTransactionsRelations = relations(dailyTransactions, ({ one, many }) => ({
  store: one(stores, {
    fields: [dailyTransactions.storeId],
    references: [stores.id],
  }),
  branch: one(storeBranches, {
    fields: [dailyTransactions.branchId],
    references: [storeBranches.id],
  }),
  supplier: one(users, {
    fields: [dailyTransactions.supplierId],
    references: [users.id],
  }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(dailyTransactions, {
    fields: [transactionItems.trxId],
    references: [dailyTransactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const globalPostsRelations = relations(globalPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [globalPosts.authorId],
    references: [users.id],
  }),
  comments: many(globalComments),
}));

export const globalCommentsRelations = relations(globalComments, ({ one }) => ({
  post: one(globalPosts, {
    fields: [globalComments.postId],
    references: [globalPosts.id],
  }),
  author: one(users, {
    fields: [globalComments.authorId],
    references: [users.id],
  }),
}));

export const localPostsRelations = relations(localPosts, ({ one, many }) => ({
  store: one(stores, {
    fields: [localPosts.storeId],
    references: [stores.id],
  }),
  author: one(users, {
    fields: [localPosts.authorId],
    references: [users.id],
  }),
  comments: many(localComments),
}));

export const localCommentsRelations = relations(localComments, ({ one }) => ({
  post: one(localPosts, {
    fields: [localComments.postId],
    references: [localPosts.id],
  }),
  author: one(users, {
    fields: [localComments.authorId],
    references: [users.id],
  }),
}));
