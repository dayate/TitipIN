<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLTableSectionElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<tbody class={cn("[&_tr:last-child]:border-0", className)} {...restProps}>
  <slot />
</tbody>
