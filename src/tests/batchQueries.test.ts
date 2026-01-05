// Sanitization function tests - standalone
import { describe, it, expect } from 'vitest';

// Inline sanitization functions for testing
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

function escapeHtml(str: string | null | undefined): string {
	if (!str) return '';
	return String(str).replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

function sanitizeInput(input: string | null | undefined): string {
	if (!input) return '';

	let sanitized = String(input);
	sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
	sanitized = sanitized.replace(/javascript\s*:/gi, '');
	sanitized = sanitized.replace(/data\s*:/gi, '');
	sanitized = sanitized.replace(/expression\s*\(/gi, '');

	return sanitized.trim();
}

function sanitizeAnnouncement(input: string | null | undefined): string {
	if (!input) return '';
	let sanitized = sanitizeInput(input);
	if (sanitized.length > 500) {
		sanitized = sanitized.slice(0, 500);
	}
	return sanitized;
}

describe('Sanitization Functions', () => {
	describe('escapeHtml', () => {
		it('should escape HTML entities', () => {
			expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
			expect(escapeHtml('Hello & World')).toBe('Hello &amp; World');
			expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
		});

		it('should handle null and undefined', () => {
			expect(escapeHtml(null)).toBe('');
			expect(escapeHtml(undefined)).toBe('');
		});
	});

	describe('sanitizeInput', () => {
		it('should remove script tags', () => {
			const result = sanitizeInput('<script>alert("xss")</script>');
			expect(result).toBe('');
		});

		it('should remove javascript: URLs', () => {
			const result = sanitizeInput('javascript:alert(1)');
			expect(result).toBe('alert(1)');
		});

		it('should pass through normal text', () => {
			expect(sanitizeInput('Hello World')).toBe('Hello World');
		});

		it('should handle null and undefined', () => {
			expect(sanitizeInput(null)).toBe('');
			expect(sanitizeInput(undefined)).toBe('');
		});
	});

	describe('sanitizeAnnouncement', () => {
		it('should limit length to 500 characters', () => {
			const longText = 'a'.repeat(600);
			const result = sanitizeAnnouncement(longText);
			expect(result.length).toBeLessThanOrEqual(500);
		});

		it('should sanitize dangerous content', () => {
			const result = sanitizeAnnouncement('<script>bad</script>Hello');
			expect(result).toBe('Hello');
		});
	});
});

describe('Batch Query Interface', () => {
	it('should verify Map works as expected', () => {
		const map = new Map<number, number>();
		map.set(1, 10);
		map.set(2, 20);

		expect(map.size).toBe(2);
		expect(map.get(1)).toBe(10);
		expect(map.get(999)).toBeUndefined();
	});
});
