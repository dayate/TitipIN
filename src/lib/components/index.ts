/**
 * UI Components Barrel Exports
 *
 * Centralized exports for all UI components.
 *
 * @example
 * import { Skeleton, ErrorBoundary, LoadingSpinner } from '$lib/components';
 *
 * @module components
 */

// Loading & State Components
export { default as Skeleton } from './Skeleton.svelte';
export { default as LoadingSpinner } from './LoadingSpinner.svelte';
export { default as ErrorBoundary } from './ErrorBoundary.svelte';

// Theme & Preferences
export { default as ThemeToggle } from './ThemeToggle.svelte';

// Utility Components
export { default as ServerClock } from './ServerClock.svelte';

// Domain-specific Components
export { default as SetoranModal } from './SetoranModal.svelte';

// Note: shadcn-ui components should be imported directly from their paths
// e.g., import { Button } from '$lib/components/ui/button';
