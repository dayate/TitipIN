/**
 * Branded Types for Type-Safe IDs
 *
 * Prevents accidental mixing of different ID types at compile time.
 * For example, you cannot pass a UserId where a StoreId is expected.
 *
 * @module types/branded
 */

/**
 * Base branded type utility
 * Creates a unique type that is structurally incompatible with other branded types
 */
declare const __brand: unique symbol;

type Brand<K, T> = K & { readonly [__brand]: T };

// ============================================
// Entity ID Types
// ============================================

/** Branded type for User IDs */
export type UserId = Brand<number, 'UserId'>;

/** Branded type for Store IDs */
export type StoreId = Brand<number, 'StoreId'>;

/** Branded type for Product IDs */
export type ProductId = Brand<number, 'ProductId'>;

/** Branded type for Transaction IDs */
export type TransactionId = Brand<number, 'TransactionId'>;

/** Branded type for Store Member IDs */
export type MemberId = Brand<number, 'MemberId'>;

/** Branded type for Notification IDs */
export type NotificationId = Brand<number, 'NotificationId'>;

/** Branded type for Audit Log IDs */
export type AuditLogId = Brand<number, 'AuditLogId'>;

/** Branded type for Invite IDs */
export type InviteId = Brand<number, 'InviteId'>;

/** Branded type for Session IDs (string-based) */
export type SessionId = Brand<string, 'SessionId'>;

// ============================================
// Value Types
// ============================================

/** Branded type for monetary values (in smallest unit, e.g., Rupiah) */
export type Money = Brand<number, 'Money'>;

/** Branded type for quantities */
export type Quantity = Brand<number, 'Quantity'>;

/** Branded type for percentages (0-100) */
export type Percentage = Brand<number, 'Percentage'>;

/** Branded type for phone numbers (normalized format) */
export type PhoneNumber = Brand<string, 'PhoneNumber'>;

/** Branded type for dates in YYYY-MM-DD format */
export type DateString = Brand<string, 'DateString'>;

/** Branded type for time in HH:MM format */
export type TimeString = Brand<string, 'TimeString'>;

/** Branded type for invite codes */
export type InviteCode = Brand<string, 'InviteCode'>;

// ============================================
// Type Guards and Constructors
// ============================================

/**
 * Create a UserId from a number
 * Use this function when converting raw numbers to typed IDs
 */
export function toUserId(id: number): UserId {
	return id as UserId;
}

/**
 * Create a StoreId from a number
 */
export function toStoreId(id: number): StoreId {
	return id as StoreId;
}

/**
 * Create a ProductId from a number
 */
export function toProductId(id: number): ProductId {
	return id as ProductId;
}

/**
 * Create a TransactionId from a number
 */
export function toTransactionId(id: number): TransactionId {
	return id as TransactionId;
}

/**
 * Create a MemberId from a number
 */
export function toMemberId(id: number): MemberId {
	return id as MemberId;
}

/**
 * Create Money from a number
 * @param amount - Amount in smallest unit (e.g., Rupiah, not thousand Rupiah)
 */
export function toMoney(amount: number): Money {
	return Math.round(amount) as Money;
}

/**
 * Create Quantity from a number
 * @param qty - Must be non-negative integer
 */
export function toQuantity(qty: number): Quantity {
	return Math.max(0, Math.round(qty)) as Quantity;
}

/**
 * Create Percentage from a number
 * @param value - Clamped to 0-100
 */
export function toPercentage(value: number): Percentage {
	return Math.max(0, Math.min(100, Math.round(value))) as Percentage;
}

/**
 * Create PhoneNumber from a string
 * @param phone - Phone number (will be normalized)
 */
export function toPhoneNumber(phone: string): PhoneNumber {
	// Normalize to format starting with 0
	let cleaned = phone.replace(/\D/g, '');
	if (cleaned.startsWith('62')) {
		cleaned = '0' + cleaned.slice(2);
	} else if (!cleaned.startsWith('0')) {
		cleaned = '0' + cleaned;
	}
	return cleaned as PhoneNumber;
}

/**
 * Create DateString from a Date or string
 * @param date - Date object or string
 */
export function toDateString(date: Date | string): DateString {
	if (typeof date === 'string') {
		// Assume already in correct format or parse
		if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return date as DateString;
		}
		date = new Date(date);
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}` as DateString;
}

/**
 * Create TimeString from hours and minutes
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 */
export function toTimeString(hours: number, minutes: number): TimeString {
	const h = String(Math.max(0, Math.min(23, hours))).padStart(2, '0');
	const m = String(Math.max(0, Math.min(59, minutes))).padStart(2, '0');
	return `${h}:${m}` as TimeString;
}

/**
 * Create InviteCode from a string
 * @param code - Invite code (will be uppercased)
 */
export function toInviteCode(code: string): InviteCode {
	return code.toUpperCase().trim() as InviteCode;
}

/**
 * Check if a number is a valid ID (positive integer)
 */
export function isValidId(id: unknown): id is number {
	return typeof id === 'number' && Number.isInteger(id) && id > 0;
}

// ============================================
// Utility Types
// ============================================

/**
 * Extract the base type from a branded type
 */
export type Unbrand<T> = T extends Brand<infer K, unknown> ? K : T;

/**
 * Make all branded types in an object optional
 */
export type WithOptionalIds<T> = {
	[K in keyof T]: T[K] extends Brand<infer B, unknown>
		? Brand<B, unknown> | undefined
		: T[K];
};
