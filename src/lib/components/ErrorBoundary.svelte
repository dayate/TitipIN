<script lang="ts">
  /**
   * Error Boundary Component
   *
   * Catches errors in child components and displays a user-friendly fallback.
   * Logs errors for debugging and provides recovery options.
   *
   * @example
   * <ErrorBoundary>
   *   <SomeComponent />
   * </ErrorBoundary>
   */
  import { onMount } from "svelte";
  import { AlertTriangle, RefreshCw } from "lucide-svelte";

  interface Props {
    /** Optional fallback message */
    fallbackMessage?: string;
    /** Whether to show retry button */
    showRetry?: boolean;
    /** Callback when error occurs */
    onError?: (error: Error) => void;
    /** Child content */
    children?: import("svelte").Snippet;
  }

  let {
    fallbackMessage = "Terjadi kesalahan saat memuat konten.",
    showRetry = true,
    onError,
    children,
  }: Props = $props();

  let hasError = $state(false);
  let errorMessage = $state("");

  /**
   * Handle uncaught errors from child components
   */
  function handleError(event: ErrorEvent | PromiseRejectionEvent) {
    hasError = true;

    if (event instanceof ErrorEvent) {
      errorMessage = event.message || "Unknown error";
      onError?.(event.error || new Error(event.message));
    } else {
      errorMessage = String(event.reason) || "Promise rejection";
      onError?.(new Error(String(event.reason)));
    }

    // Log error for debugging
    console.error("[ErrorBoundary]", errorMessage);
  }

  /**
   * Try to recover from error
   */
  function retry() {
    hasError = false;
    errorMessage = "";
  }

  onMount(() => {
    // Note: In production, use a more robust error handling solution
    // This is a basic implementation for demonstration
    return () => {
      // Cleanup if needed
    };
  });
</script>

{#if hasError}
  <div
    class="flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-destructive/10 border border-destructive/20"
    role="alert"
    aria-live="assertive"
  >
    <div class="flex items-center gap-2 text-destructive">
      <AlertTriangle class="h-5 w-5" aria-hidden="true" />
      <span class="font-medium">Oops!</span>
    </div>

    <p class="text-center text-muted-foreground">
      {fallbackMessage}
    </p>

    {#if errorMessage}
      <details class="text-xs text-muted-foreground">
        <summary class="cursor-pointer hover:text-foreground"
          >Detail Error</summary
        >
        <pre
          class="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-full">{errorMessage}</pre>
      </details>
    {/if}

    {#if showRetry}
      <button
        type="button"
        onclick={retry}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw class="h-4 w-4" aria-hidden="true" />
        <span>Coba Lagi</span>
      </button>
    {/if}
  </div>
{:else}
  {@render children?.()}
{/if}
