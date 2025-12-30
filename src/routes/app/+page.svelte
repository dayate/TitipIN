<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Store, Search, Bell, Clock } from 'lucide-svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<div class="p-6">
  <!-- Page Header -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Beranda</h1>
      <p class="text-muted-foreground">Selamat datang, {data.user?.name || 'Penyetor'}</p>
    </div>
    <a href="/app/notifications" class="relative p-2 rounded-lg hover:bg-accent">
      <Bell class="h-5 w-5" />
      {#if data.unreadNotifCount > 0}
        <span class="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
          {data.unreadNotifCount}
        </span>
      {/if}
    </a>
  </div>

  <!-- Active Stores -->
  {#if data.activeStores && data.activeStores.length > 0}
    <div class="mb-6">
      <h2 class="font-semibold mb-3">Lapak Saya</h2>
      <div class="grid gap-3">
        {#each data.activeStores as store}
          <a href="/app/{store.id}" class="block">
            <Card class="hover:border-primary/50 transition-colors">
              <CardContent class="p-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {#if store.logoUrl}
                      <img src={store.logoUrl} alt={store.name} class="w-12 h-12 rounded-lg object-cover" />
                    {:else}
                      <Store class="h-6 w-6 text-primary" />
                    {/if}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold truncate">{store.name}</h3>
                      <Badge variant={store.isOpen ? 'default' : 'secondary'} class="shrink-0">
                        {store.isOpen ? 'Buka' : 'Tutup'}
                      </Badge>
                    </div>
                    <div class="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Clock class="h-3 w-3" />
                      <span>{store.openTime} - {store.closeTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Pending Requests -->
  {#if data.pendingStores && data.pendingStores.length > 0}
    <div class="mb-6">
      <h2 class="font-semibold mb-3">Menunggu Persetujuan</h2>
      <div class="grid gap-3">
        {#each data.pendingStores as store}
          <Card class="border-dashed">
            <CardContent class="p-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Store class="h-6 w-6 text-muted-foreground" />
                </div>
                <div class="flex-1">
                  <h3 class="font-medium">{store.name}</h3>
                  <p class="text-sm text-muted-foreground">Menunggu persetujuan pemilik</p>
                </div>
                <Badge variant="outline" class="shrink-0">
                  ⏳ Pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Empty State -->
  {#if (!data.activeStores || data.activeStores.length === 0) && (!data.pendingStores || data.pendingStores.length === 0)}
    <Card>
      <CardContent class="py-12 text-center">
        <Store class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="font-semibold mb-2">Belum bergabung ke lapak</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Cari dan gabung ke lapak untuk mulai menitipkan produk
        </p>
        <Button href="/stores">
          <Search class="h-4 w-4 mr-2" />
          Cari Lapak
        </Button>
      </CardContent>
    </Card>
  {/if}

  <!-- Quick Actions -->
  {#if data.activeStores && data.activeStores.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-4">
          <a href="/stores" class="flex flex-col items-center p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
            <Search class="h-6 w-6 mb-2 text-primary" />
            <span class="text-sm font-medium">Cari Lapak</span>
          </a>
          <a href="/app/notifications" class="flex flex-col items-center p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors relative">
            <Bell class="h-6 w-6 mb-2 text-primary" />
            <span class="text-sm font-medium">Notifikasi</span>
            {#if data.unreadNotifCount > 0}
              <span class="absolute top-2 right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                {data.unreadNotifCount}
              </span>
            {/if}
          </a>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
