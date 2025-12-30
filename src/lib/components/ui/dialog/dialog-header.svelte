<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<div
  class={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
  {...restProps}
>
  <slot />
</div>
