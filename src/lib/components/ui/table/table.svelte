<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLTableElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<div class="relative w-full overflow-auto">
  <table class={cn("w-full caption-bottom text-sm", className)} {...restProps}>
    <slot />
  </table>
</div>
