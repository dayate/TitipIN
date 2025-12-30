<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import {
    LayoutDashboard, Users, ClipboardCheck, Package, MessageSquare,
    Megaphone, BarChart3, Settings, User, ChevronLeft, ChevronRight,
    Menu, X, Store
  } from 'lucide-svelte';

  interface Props {
    storeId: string;
    storeName?: string;
    logoUrl?: string;
    collapsed?: boolean;
    mobileOpen?: boolean;
    onToggleCollapse?: () => void;
    onToggleMobile?: () => void;
  }

  let {
    storeId,
    storeName = 'Lapak',
    logoUrl,
    collapsed = $bindable(false),
    mobileOpen = $bindable(false),
    onToggleCollapse,
    onToggleMobile
  }: Props = $props();

  const menuItems = $derived([
    { href: `/owner/${storeId}`, icon: LayoutDashboard, label: 'Dashboard' },
    { href: `/owner/${storeId}/members`, icon: Users, label: 'Anggota' },
    { href: `/owner/${storeId}/transactions`, icon: ClipboardCheck, label: 'Validasi Setoran' },
    { href: `/owner/${storeId}/products`, icon: Package, label: 'Produk' },
    { href: `/owner/${storeId}/community`, icon: MessageSquare, label: 'Komunitas' },
    { href: `/owner/${storeId}/announcements`, icon: Megaphone, label: 'Pengumuman' },
    { href: `/owner/${storeId}/reports`, icon: BarChart3, label: 'Laporan' },
    { href: `/owner/${storeId}/settings`, icon: Settings, label: 'Pengaturan' },
  ]);

  const bottomMenuItems = $derived([
    { href: `/owner/profile`, icon: User, label: 'Profil' },
  ]);

  function isActive(href: string): boolean {
    const currentPath = $page.url.pathname;
    if (href === `/owner/${storeId}`) {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  }

  function handleNavClick() {
    if (mobileOpen) {
      mobileOpen = false;
      onToggleMobile?.();
    }
  }
</script>

<!-- Mobile Overlay -->
{#if mobileOpen}
  <div
    class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onclick={() => { mobileOpen = false; onToggleMobile?.(); }}
    onkeydown={(e) => e.key === 'Escape' && (mobileOpen = false)}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Mobile Toggle Button -->
<button
  class="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-background border shadow-md"
  onclick={() => { mobileOpen = !mobileOpen; onToggleMobile?.(); }}
>
  {#if mobileOpen}
    <X class="h-5 w-5" />
  {:else}
    <Menu class="h-5 w-5" />
  {/if}
</button>

<!-- Sidebar -->
<aside
  class="fixed top-0 left-0 h-full bg-background border-r z-50 transition-all duration-300 flex flex-col
    {collapsed ? 'w-16' : 'w-64'}
    {mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
>
  <!-- Header -->
  <div class="p-4 border-b flex items-center gap-3 {collapsed ? 'justify-center' : ''}">
    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
      {#if logoUrl}
        <img src={logoUrl} alt="" class="w-10 h-10 object-cover" />
      {:else}
        <Store class="h-5 w-5 text-primary" />
      {/if}
    </div>
    {#if !collapsed}
      <div class="flex-1 min-w-0">
        <p class="font-semibold truncate">{storeName}</p>
        <p class="text-xs text-muted-foreground">Admin Panel</p>
      </div>
    {/if}
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto p-2 space-y-1">
    {#each menuItems as item}
      <a
        href={item.href}
        onclick={handleNavClick}
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          {collapsed ? 'justify-center' : ''}
          {isActive(item.href)
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent text-muted-foreground hover:text-foreground'}"
        title={collapsed ? item.label : undefined}
      >
        <item.icon class="h-5 w-5 shrink-0" />
        {#if !collapsed}
          <span class="truncate">{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Bottom Section -->
  <div class="p-2 border-t space-y-1">
    {#each bottomMenuItems as item}
      <a
        href={item.href}
        onclick={handleNavClick}
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          {collapsed ? 'justify-center' : ''}
          {isActive(item.href)
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent text-muted-foreground hover:text-foreground'}"
        title={collapsed ? item.label : undefined}
      >
        <item.icon class="h-5 w-5 shrink-0" />
        {#if !collapsed}
          <span class="truncate">{item.label}</span>
        {/if}
      </a>
    {/each}

    <!-- Collapse Toggle (Desktop only) -->
    <button
      class="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
        hover:bg-accent text-muted-foreground hover:text-foreground
        {collapsed ? 'justify-center' : ''}"
      onclick={() => { collapsed = !collapsed; onToggleCollapse?.(); }}
      title={collapsed ? 'Expand' : 'Collapse'}
    >
      {#if collapsed}
        <ChevronRight class="h-5 w-5 shrink-0" />
      {:else}
        <ChevronLeft class="h-5 w-5 shrink-0" />
        <span class="truncate">Tutup</span>
      {/if}
    </button>
  </div>
</aside>
