<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ArrowLeft, Package, History, Users2, MessageSquare, Clock } from 'lucide-svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<div class="p-6">
  <!-- Back Button -->
  <Button variant="ghost" href="/app" class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <!-- Store Header -->
  <div class="flex items-center gap-4 mb-6">
    <div class="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
      {#if data.store?.logoUrl}
        <img src={data.store.logoUrl} alt={data.store.name} class="w-14 h-14 rounded-lg object-cover" />
      {:else}
        <span class="text-2xl">🏪</span>
      {/if}
    </div>
    <div>
      <h1 class="text-xl font-bold">{data.store?.name}</h1>
      <div class="flex items-center gap-2 mt-1">
        <Badge variant={data.store?.isOpen ? 'default' : 'secondary'}>
          {data.store?.isOpen ? '🟢 Buka' : '🔴 Tutup'}
        </Badge>
        <span class="text-sm text-muted-foreground flex items-center gap-1">
          <Clock class="h-3 w-3" />
          {data.store?.openTime} - {data.store?.closeTime}
        </span>
      </div>
    </div>
  </div>

  <!-- Announcement -->
  {#if data.store?.announcement}
    <div class="bg-accent border border-border rounded-xl p-4 mb-6">
      <div class="flex items-start gap-3">
        <span class="text-xl">📢</span>
        <p class="text-foreground">{data.store.announcement}</p>
      </div>
    </div>
  {/if}

  <!-- Today Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent class="pt-4">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Masuk</p>
          <p class="text-2xl font-bold text-primary">{data.todayStats?.totalIn || 0}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Terjual</p>
          <p class="text-2xl font-bold text-chart-2">{data.todayStats?.totalSold || 0}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Sisa</p>
          <p class="text-2xl font-bold text-destructive">{data.todayStats?.totalReturned || 0}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Pendapatan</p>
          <p class="text-lg font-bold text-chart-4">Rp {(data.todayStats?.totalPayout || 0).toLocaleString('id-ID')}</p>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Quick Actions -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="text-lg">Menu</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="/app/{data.storeId}/setor"
          class="flex flex-col items-center p-4 rounded-lg transition-colors {data.store?.isOpen ? 'bg-primary/10 hover:bg-primary/20' : 'bg-muted opacity-50 pointer-events-none'}"
        >
          <span class="text-2xl mb-2">📦</span>
          <span class="text-sm font-medium {data.store?.isOpen ? 'text-primary' : 'text-muted-foreground'}">Setor Barang</span>
        </a>
        <a href="/app/{data.storeId}/products" class="flex flex-col items-center p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
          <Package class="h-6 w-6 mb-2 text-primary" />
          <span class="text-sm font-medium">Produk Saya</span>
        </a>
        <a href="/app/{data.storeId}/history" class="flex flex-col items-center p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
          <History class="h-6 w-6 mb-2 text-primary" />
          <span class="text-sm font-medium">Riwayat</span>
        </a>
        <a href="/app/{data.storeId}/community" class="flex flex-col items-center p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
          <MessageSquare class="h-6 w-6 mb-2 text-primary" />
          <span class="text-sm font-medium">Komunitas</span>
        </a>
      </div>
    </CardContent>
  </Card>

  <!-- My Products -->
  {#if data.products && data.products.length > 0}
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle class="text-lg">Produk Aktif</CardTitle>
        <a href="/app/{data.storeId}/products" class="text-sm text-primary hover:underline">Lihat Semua →</a>
      </CardHeader>
      <CardContent>
        <div class="divide-y">
          {#each data.products.slice(0, 5) as product}
            <div class="flex items-center gap-3 py-3">
              <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {#if product.imageUrl}
                  <img src={product.imageUrl} alt="" class="w-full h-full object-cover" />
                {:else}
                  <Package class="h-4 w-4 text-muted-foreground" />
                {/if}
              </div>
              <div class="flex-1">
                <p class="font-medium text-sm">{product.name}</p>
                <p class="text-xs text-muted-foreground">Rp {product.priceSell.toLocaleString('id-ID')}</p>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
