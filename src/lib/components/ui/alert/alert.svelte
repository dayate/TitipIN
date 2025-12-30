<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { tv, type VariantProps } from "tailwind-variants";
  import { cn } from "$lib/utils";

  const alertVariants = tv({
    base: "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-primary/50 text-primary dark:border-primary [&>svg]:text-primary bg-primary/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });

  type AlertVariants = VariantProps<typeof alertVariants>;

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariants["variant"];
    class?: string;
  }

  let { variant = "default", class: className, ...restProps }: Props = $props();
</script>

<div
  class={cn(alertVariants({ variant }), className)}
  role="alert"
  {...restProps}
>
  <slot />
</div>
