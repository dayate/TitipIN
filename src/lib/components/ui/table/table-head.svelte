<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLTableCellElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<th class={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...restProps}>
  <slot />
</th>
