<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn("flex items-center p-6 pt-0", className)} {...restProps}>
  <slot />
</div>
