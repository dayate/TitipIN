<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    class?: string;
  }

  let { class: className, ...restProps }: Props = $props();
</script>

<div
  class={cn("text-sm [&_p]:leading-relaxed", className)}
  {...restProps}
>
  <slot />
</div>
