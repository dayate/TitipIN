<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLTableCellElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<td class={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...restProps}>
  <slot />
</td>
