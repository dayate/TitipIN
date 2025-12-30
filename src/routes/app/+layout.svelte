<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { Menu, LogOut, ChevronLeft, Home, Package, Cookie, History, Bell } from 'lucide-svelte';

  let { children, data } = $props();

  const menuItems = [
    { href: '/app', icon: Home, label: 'Beranda' },
    { href: '/app/setor', icon: Package, label: 'Setor Barang' },
    { href: '/app/products', icon: Cookie, label: 'Produk Saya' },
    { href: '/app/history', icon: History, label: 'Riwayat' },
    { href: '/app/notifications', icon: Bell, label: 'Notifikasi' },
  ];

  let sidebarOpen = $state(true);
  let sidebarMobileOpen = $state(false);
</script>

<!-- Mobile Header -->
<header class="lg:hidden bg-primary text-primary-foreground p-4 sticky top-0 z-40">
  <div class="flex items-center justify-between">
    <Button variant="ghost" size="icon" onclick={() => sidebarMobileOpen = true} class="text-current hover:bg-white/10">
      <Menu class="h-6 w-6" />
    </Button>
    <h1 class="font-bold">Mak Unyil</h1>
    <div class="flex items-center gap-1">
      <ThemeToggle />
      <Button variant="ghost" size="icon" class="text-current hover:bg-white/10" onclick={() => window.location.href = '/app/notifications'}>
        <Bell class="h-5 w-5" />
      </Button>
    </div>
  </div>
</header>

<div class="flex min-h-screen bg-background">
  <!-- Sidebar Overlay (Mobile) -->
  {#if sidebarMobileOpen}
    <button
      type="button"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      onclick={() => sidebarMobileOpen = false}
      aria-label="Close sidebar"
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside class="
    fixed lg:sticky inset-y-0 left-0 z-50 top-0 h-screen
    bg-card shadow-lg transition-all duration-300 ease-in-out border-r
    {sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    {sidebarOpen ? 'w-64' : 'w-16'}
  ">
    <!-- Sidebar Header -->
    <div class="p-4 border-b bg-primary flex items-center justify-between">
      {#if sidebarOpen}
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span class="text-lg">🍩</span>
          </div>
          <div class="text-primary-foreground">
            <h2 class="font-bold text-sm">Mak Unyil</h2>
            <p class="text-xs opacity-80">Penyetor</p>
          </div>
        </div>
      {:else}
        <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto">
          <span class="text-lg">🍩</span>
        </div>
      {/if}

      <!-- Toggle Button (Desktop) -->
      <Button
        variant="ghost"
        size="icon"
        class="hidden lg:flex text-primary-foreground hover:bg-white/20"
        onclick={() => sidebarOpen = !sidebarOpen}
      >
        <ChevronLeft class="h-5 w-5 transition-transform {sidebarOpen ? '' : 'rotate-180'}" />
      </Button>
    </div>

    <!-- User Info -->
    {#if sidebarOpen}
      <div class="p-4 border-b bg-accent">
        <p class="text-xs text-muted-foreground">Selamat datang,</p>
        <p class="font-medium truncate">{data?.user?.name || 'Penyetor'}</p>
      </div>
    {/if}

    <!-- Navigation -->
    <nav class="p-2 overflow-y-auto" style="height: calc(100vh - {sidebarOpen ? '200px' : '140px'})">
      <ul class="space-y-1">
        {#each menuItems as item}
          {@const isActive = $page.url.pathname === item.href ||
            (item.href !== '/app' && $page.url.pathname.startsWith(item.href))}
          {@const Icon = item.icon}
          <li>
            <a
              href={item.href}
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}"
              onclick={() => sidebarMobileOpen = false}
              title={!sidebarOpen ? item.label : ''}
            >
              <Icon class="h-5 w-5 {sidebarOpen ? '' : 'mx-auto'}" />
              {#if sidebarOpen}
                <span class="text-sm">{item.label}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Logout -->
    <div class="absolute bottom-0 left-0 right-0 p-2 border-t bg-card">
      <a
        href="/api/auth/logout"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        title={!sidebarOpen ? 'Keluar' : ''}
      >
        <LogOut class="h-5 w-5 {sidebarOpen ? '' : 'mx-auto'}" />
        {#if sidebarOpen}
          <span class="text-sm">Keluar</span>
        {/if}
      </a>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 min-w-0">
    {@render children()}
  </main>
</div>
