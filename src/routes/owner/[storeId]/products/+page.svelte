<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ArrowLeft, Package, Check, X, Clock } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  async function handleProductAction(productId: number, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/stores/${data.storeId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal memproses');
        return;
      }

      toast.success(action === 'approve' ? 'Produk disetujui!' : 'Produk ditolak');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  }
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">Kelola Produk</h1>
    <p class="text-muted-foreground">{data.store?.name}</p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <Card>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold text-yellow-500">{data.stats?.pending || 0}</p>
        <p class="text-sm text-muted-foreground">Pending</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold text-green-500">{data.stats?.approved || 0}</p>
        <p class="text-sm text-muted-foreground">Disetujui</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold text-red-500">{data.stats?.rejected || 0}</p>
        <p class="text-sm text-muted-foreground">Ditolak</p>
      </CardContent>
    </Card>
  </div>

  <!-- Pending Products -->
  {#if data.pendingProducts && data.pendingProducts.length > 0}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Clock class="h-5 w-5 text-yellow-500" />
          Menunggu Persetujuan ({data.pendingProducts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#each data.pendingProducts as product}
            <div class="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
              <div class="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {#if product.imageUrl}
                  <img src={product.imageUrl} alt="" class="w-full h-full object-cover" />
                {:else}
                  <Package class="h-6 w-6 text-muted-foreground" />
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium">{product.name}</p>
                <p class="text-sm text-muted-foreground">oleh {product.supplierName}</p>
                <p class="text-sm text-muted-foreground">
                  Setor: Rp {product.priceBuy.toLocaleString('id-ID')} · Jual: Rp {product.priceSell.toLocaleString('id-ID')}
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onclick={() => handleProductAction(product.id, 'reject')}>
                  <X class="h-4 w-4" />
                </Button>
                <Button size="sm" onclick={() => handleProductAction(product.id, 'approve')}>
                  <Check class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Approved Products -->
  <Card>
    <CardHeader>
      <CardTitle>Produk Aktif ({data.approvedProducts?.length || 0})</CardTitle>
    </CardHeader>
    <CardContent>
      {#if data.approvedProducts && data.approvedProducts.length > 0}
        <div class="space-y-2">
          {#each data.approvedProducts as product}
            <div class="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
              <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {#if product.imageUrl}
                  <img src={product.imageUrl} alt="" class="w-full h-full object-cover" />
                {:else}
                  <Package class="h-4 w-4 text-muted-foreground" />
                {/if}
              </div>
              <div class="flex-1">
                <p class="font-medium">{product.name}</p>
                <p class="text-sm text-muted-foreground">{product.supplierName}</p>
              </div>
              <Badge variant="default">Aktif</Badge>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-muted-foreground py-4">Belum ada produk</p>
      {/if}
    </CardContent>
  </Card>
</div>
