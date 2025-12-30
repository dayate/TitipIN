<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLTableRowElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<tr class={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...restProps}>
  <slot />
</tr>
