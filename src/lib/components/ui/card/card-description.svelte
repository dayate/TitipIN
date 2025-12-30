<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...restProps}>
  <slot />
</p>
