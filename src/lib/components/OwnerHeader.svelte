<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import {
    Store, User, LogOut
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  interface Props {
    storeName?: string;
    userName?: string;
    userAvatar?: string;
    collapsed?: boolean;
  }

  let {
    storeName = 'Admin Panel',
    userName = 'User',
    userAvatar,
    collapsed = false,
  }: Props = $props();

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Berhasil logout');
        goto('/auth/login');
      }
    } catch (e) {
      toast.error('Gagal logout');
    }
  }
</script>

<header
  class="fixed top-0 right-0 h-14 bg-background/95 backdrop-blur border-b z-30 transition-all duration-300
    {collapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'}"
>
  <div class="flex items-center justify-between h-full px-4 lg:px-6">
    <!-- Left: App Info (mobile only - store name, offset for hamburger) -->
    <div class="flex items-center gap-3 lg:hidden pl-10">
      <Store class="h-5 w-5 text-primary" />
      <span class="font-semibold truncate max-w-[150px]">{storeName}</span>
    </div>

    <!-- Desktop left: App title -->
    <div class="hidden lg:flex items-center gap-2">
      <h1 class="text-lg font-semibold">Mak Unyil - Konsinyasi Digital</h1>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <ThemeToggle />

      <!-- User info -->
      <div class="flex items-center gap-2 px-2">
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {#if userAvatar}
            <img src={userAvatar} alt="" class="w-full h-full object-cover" />
          {:else}
            <User class="h-4 w-4 text-primary" />
          {/if}
        </div>
        <span class="hidden sm:inline text-sm font-medium">{userName}</span>
      </div>

      <!-- Logout button -->
      <Button variant="ghost" size="sm" onclick={handleLogout} title="Logout">
        <LogOut class="h-4 w-4" />
      </Button>
    </div>
  </div>
</header>
