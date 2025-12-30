<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLTableSectionElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<thead class={cn("[&_tr]:border-b", className)} {...restProps}>
  <slot />
</thead>
