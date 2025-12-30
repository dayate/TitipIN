<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLHeadingElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<h5
  class={cn("mb-1 font-medium leading-none tracking-tight", className)}
  {...restProps}
>
  <slot />
</h5>
