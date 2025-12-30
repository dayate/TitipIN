<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<div
  class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
  {...restProps}
>
  <slot />
</div>
