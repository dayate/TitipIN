/**
 * Feature Flags System
 *
 * Runtime feature toggles for gradual rollouts, A/B testing,
 * and environment-based feature management.
 *
 * @module server/featureFlags
 */

import { env } from '$env/dynamic/private';

/**
 * All available feature flags
 */
export const FEATURES = {
	/** Enable WhatsApp notification integration */
	WHATSAPP_INTEGRATION: 'whatsapp_integration',
	/** Enable PWA features */
	PWA_ENABLED: 'pwa_enabled',
	/** Enable analytics dashboard */
	ANALYTICS_DASHBOARD: 'analytics_dashboard',
	/** Enable advanced reporting */
	ADVANCED_REPORTS: 'advanced_reports',
	/** Enable supplier reliability tracking */
	RELIABILITY_TRACKING: 'reliability_tracking',
	/** Enable community features */
	COMMUNITY_FEATURES: 'community_features',
	/** Enable store branches */
	STORE_BRANCHES: 'store_branches',
	/** Enable dark mode toggle */
	DARK_MODE: 'dark_mode',
	/** Enable export to PDF */
	PDF_EXPORT: 'pdf_export',
	/** Enable audit log viewer */
	AUDIT_LOG_VIEWER: 'audit_log_viewer',
	/** Enable new transaction UI */
	NEW_TRANSACTION_UI: 'new_transaction_ui'
} as const;

export type FeatureFlag = typeof FEATURES[keyof typeof FEATURES];

/**
 * Default feature states
 * These can be overridden by environment variables
 */
const defaultFeatures: Record<FeatureFlag, boolean> = {
	[FEATURES.WHATSAPP_INTEGRATION]: false,
	[FEATURES.PWA_ENABLED]: false,
	[FEATURES.ANALYTICS_DASHBOARD]: true,
	[FEATURES.ADVANCED_REPORTS]: true,
	[FEATURES.RELIABILITY_TRACKING]: true,
	[FEATURES.COMMUNITY_FEATURES]: false,
	[FEATURES.STORE_BRANCHES]: false,
	[FEATURES.DARK_MODE]: true,
	[FEATURES.PDF_EXPORT]: false,
	[FEATURES.AUDIT_LOG_VIEWER]: true,
	[FEATURES.NEW_TRANSACTION_UI]: true
};

/**
 * Parse feature flags from environment variable
 * Format: "flag1,flag2,flag3" (all listed flags are enabled)
 */
function parseEnabledFeatures(): Set<string> {
	const enabledStr = env.ENABLED_FEATURES || '';
	return new Set(enabledStr.split(',').map(f => f.trim()).filter(Boolean));
}

/**
 * Parse disabled features from environment variable
 * Format: "flag1,flag2,flag3" (all listed flags are disabled)
 */
function parseDisabledFeatures(): Set<string> {
	const disabledStr = env.DISABLED_FEATURES || '';
	return new Set(disabledStr.split(',').map(f => f.trim()).filter(Boolean));
}

/**
 * Check if a feature is enabled
 * Priority: DISABLED_FEATURES > ENABLED_FEATURES > default
 *
 * @param feature - The feature flag to check
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
	const disabled = parseDisabledFeatures();
	const enabled = parseEnabledFeatures();

	// Disabled takes priority
	if (disabled.has(feature)) {
		return false;
	}

	// Then check enabled
	if (enabled.has(feature)) {
		return true;
	}

	// Fall back to default
	return defaultFeatures[feature] ?? false;
}

/**
 * Check if multiple features are all enabled
 * @param features - Array of feature flags to check
 * @returns Whether all features are enabled
 */
export function areAllFeaturesEnabled(features: FeatureFlag[]): boolean {
	return features.every(isFeatureEnabled);
}

/**
 * Check if any of the features are enabled
 * @param features - Array of feature flags to check
 * @returns Whether any feature is enabled
 */
export function isAnyFeatureEnabled(features: FeatureFlag[]): boolean {
	return features.some(isFeatureEnabled);
}

/**
 * Get all enabled features
 * @returns Array of enabled feature flags
 */
export function getEnabledFeatures(): FeatureFlag[] {
	return Object.values(FEATURES).filter(isFeatureEnabled);
}

/**
 * Get feature flags configuration for client-side use
 * Only expose safe-to-expose flags to the client
 *
 * @returns Object with feature states
 */
export function getClientFeatures(): Record<FeatureFlag, boolean> {
	const result = {} as Record<FeatureFlag, boolean>;

	for (const feature of Object.values(FEATURES)) {
		result[feature] = isFeatureEnabled(feature);
	}

	return result;
}

/**
 * Feature flag guard for conditional logic
 *
 * @example
 * withFeature(FEATURES.ANALYTICS_DASHBOARD, () => {
 *   // Only runs if analytics is enabled
 * });
 */
export function withFeature<T>(
	feature: FeatureFlag,
	callback: () => T
): T | undefined {
	if (isFeatureEnabled(feature)) {
		return callback();
	}
	return undefined;
}

/**
 * Async feature flag guard
 */
export async function withFeatureAsync<T>(
	feature: FeatureFlag,
	callback: () => Promise<T>
): Promise<T | undefined> {
	if (isFeatureEnabled(feature)) {
		return await callback();
	}
	return undefined;
}
