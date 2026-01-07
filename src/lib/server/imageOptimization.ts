/**
 * Image Optimization Utilities
 *
 * Provides utilities for optimizing images before storage.
 * Includes resize, compression, and format conversion hints.
 *
 * Note: Full image processing requires additional packages like 'sharp'.
 * This module provides the configuration and helper functions.
 *
 * @module server/imageOptimization
 */

/**
 * Maximum dimensions for optimized images
 */
export const IMAGE_CONFIG = {
	// Product images
	product: {
		maxWidth: 800,
		maxHeight: 800,
		quality: 85,
		format: 'webp' as const
	},
	// Store logos
	logo: {
		maxWidth: 400,
		maxHeight: 400,
		quality: 90,
		format: 'webp' as const
	},
	// Store banners
	banner: {
		maxWidth: 1200,
		maxHeight: 400,
		quality: 85,
		format: 'webp' as const
	},
	// User avatars
	avatar: {
		maxWidth: 200,
		maxHeight: 200,
		quality: 90,
		format: 'webp' as const
	},
	// Note photos (transaction receipts)
	notePhoto: {
		maxWidth: 1000,
		maxHeight: 1400,
		quality: 80,
		format: 'webp' as const
	}
} as const;

export type ImageType = keyof typeof IMAGE_CONFIG;

/**
 * Validates image file type
 * @param mimeType - The MIME type to validate
 * @returns Whether the type is allowed
 */
export function isValidImageType(mimeType: string): boolean {
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
	return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Validates image file size
 * @param sizeBytes - File size in bytes
 * @param maxMB - Maximum allowed size in megabytes
 * @returns Whether the size is allowed
 */
export function isValidImageSize(sizeBytes: number, maxMB: number = 5): boolean {
	const maxBytes = maxMB * 1024 * 1024;
	return sizeBytes <= maxBytes;
}

/**
 * Generates optimized filename with timestamp
 * @param originalName - Original file name
 * @param type - Image type for prefix
 * @returns Optimized filename
 */
export function generateImageFilename(originalName: string, type: ImageType): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = 'webp'; // Always use webp for optimized images
	return `${type}_${timestamp}_${random}.${extension}`;
}

/**
 * Gets the config for an image type
 * @param type - The image type
 * @returns Configuration object
 */
export function getImageConfig(type: ImageType) {
	return IMAGE_CONFIG[type];
}

/**
 * Generates responsive image srcset hints
 * For use with lazy loading implementations
 * @param basePath - Base path to the image
 * @param widths - Array of widths for responsive images
 * @returns Srcset string
 */
export function generateSrcsetHint(basePath: string, widths: number[] = [320, 640, 960]): string {
	return widths.map((w) => `${basePath}?w=${w} ${w}w`).join(', ');
}

/**
 * Lazy loading attributes for images
 * Use these attributes on <img> elements for better performance
 */
export const LAZY_LOAD_ATTRS = {
	loading: 'lazy' as const,
	decoding: 'async' as const
};

/**
 * Generate blur placeholder data URL (tiny base64 image)
 * This is a simple gray placeholder - for production, use actual blurred thumbnails
 * @returns Base64 data URL for placeholder
 */
export function generatePlaceholder(): string {
	// 1x1 transparent gray pixel
	return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQcB/lbZiZQAAAAASUVORK5CYII=';
}

/**
 * Image upload validation result
 */
export interface ImageValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validates an uploaded image file
 * @param file - The file to validate
 * @param maxMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateImageUpload(
	file: { type: string; size: number },
	maxMB: number = 5
): ImageValidationResult {
	if (!isValidImageType(file.type)) {
		return {
			valid: false,
			error: 'Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP.'
		};
	}

	if (!isValidImageSize(file.size, maxMB)) {
		return {
			valid: false,
			error: `Ukuran file terlalu besar. Maksimal ${maxMB}MB.`
		};
	}

	return { valid: true };
}
