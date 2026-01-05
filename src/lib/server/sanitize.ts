/**
 * Input Sanitization Utility
 * Provides XSS protection for user-generated content
 */

// Simple HTML entity encoding for basic XSS protection
// For production, consider using DOMPurify on the client side
const htmlEntities: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;'
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(str: string | null | undefined): string {
	if (!str) return '';
	return String(str).replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize user input - removes dangerous patterns
 */
export function sanitizeInput(input: string | null | undefined): string {
	if (!input) return '';

	let sanitized = String(input);

	// Remove script tags and their content
	sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

	// Remove event handlers (onclick, onerror, etc.)
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

	// Remove javascript: and data: URLs
	sanitized = sanitized.replace(/javascript\s*:/gi, '');
	sanitized = sanitized.replace(/data\s*:/gi, '');

	// Remove style expressions
	sanitized = sanitized.replace(/expression\s*\(/gi, '');

	// Trim whitespace
	sanitized = sanitized.trim();

	return sanitized;
}

/**
 * Sanitize for display in HTML context
 * Combines sanitization + HTML escaping
 */
export function sanitizeForHtml(input: string | null | undefined): string {
	return escapeHtml(sanitizeInput(input));
}

/**
 * Sanitize announcement text (allows some basic formatting)
 */
export function sanitizeAnnouncement(input: string | null | undefined): string {
	if (!input) return '';

	let sanitized = sanitizeInput(input);

	// Limit length
	if (sanitized.length > 500) {
		sanitized = sanitized.slice(0, 500);
	}

	return sanitized;
}

/**
 * Sanitize admin note
 */
export function sanitizeAdminNote(input: string | null | undefined): string {
	if (!input) return '';

	let sanitized = sanitizeInput(input);

	// Limit length
	if (sanitized.length > 500) {
		sanitized = sanitized.slice(0, 500);
	}

	return sanitized;
}

/**
 * Sanitize rejection reason
 */
export function sanitizeReason(input: string | null | undefined): string {
	if (!input) return '';

	let sanitized = sanitizeInput(input);

	// Limit length
	if (sanitized.length > 500) {
		sanitized = sanitized.slice(0, 500);
	}

	return sanitized;
}

/**
 * Sanitize request message
 */
export function sanitizeMessage(input: string | null | undefined): string {
	if (!input) return '';

	let sanitized = sanitizeInput(input);

	// Limit length
	if (sanitized.length > 500) {
		sanitized = sanitized.slice(0, 500);
	}

	return sanitized;
}

export default {
	escapeHtml,
	sanitizeInput,
	sanitizeForHtml,
	sanitizeAnnouncement,
	sanitizeAdminNote,
	sanitizeReason,
	sanitizeMessage
};
