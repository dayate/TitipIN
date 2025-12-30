<script lang="ts">
  import { Toaster as Sonner, type ToasterProps } from "svelte-sonner";

  let {
    class: className,
    ...restProps
  }: ToasterProps = $props();
</script>

<Sonner
  class="toaster group"
  toastOptions={{
    classes: {
      toast:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton:
        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton:
        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      error:
        "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
      success:
        "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
    },
  }}
  {...restProps}
/>
