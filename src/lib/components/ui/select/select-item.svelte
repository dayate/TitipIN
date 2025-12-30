<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { cn } from "$lib/utils";

  let {
    class: className,
    children,
    ...restProps
  }: SelectPrimitive.ItemProps & { class?: string } = $props();
</script>

<SelectPrimitive.Item
  class={cn(
    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
    className
  )}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</SelectPrimitive.Item>
