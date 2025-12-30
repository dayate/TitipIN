<script lang="ts">
  import type { PageData } from './$types';
  import { goto, invalidateAll } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { ArrowLeft, Plus, Loader2, X } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let showAddModal = $state(false);
  let formName = $state('');
  let formPriceBuy = $state('');
  let formPriceSell = $state('');
  let loading = $state(false);

  function resetForm() {
    formName = '';
    formPriceBuy = '';
    formPriceSell = '';
  }

  async function handleSubmit() {
    if (!formName || !formPriceBuy || !formPriceSell) {
      toast.error('Semua field wajib diisi');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/products/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          priceBuy: parseInt(formPriceBuy),
          priceSell: parseInt(formPriceSell),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Produk berhasil diajukan! Menunggu persetujuan admin.');
        resetForm();
        showAddModal = false;
        await invalidateAll();
      } else {
        toast.error(result.error || 'Gagal mengajukan produk');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="bg-card border-b sticky top-0 z-10">
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" onclick={() => goto('/app')}>
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <h1 class="text-lg font-bold">Produk Saya</h1>
      </div>
      <Button size="sm" onclick={() => { resetForm(); showAddModal = true; }}>
        <Plus class="h-4 w-4" />
        Ajukan Baru
      </Button>
    </div>
  </header>

  <main class="p-4">
    <!-- Pending Products -->
    {#if data.pendingProducts.length > 0}
      <div class="mb-6">
        <h2 class="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-chart-4"></span>
          Menunggu Persetujuan
        </h2>
        <div class="space-y-2">
          {#each data.pendingProducts as product}
            <Card class="opacity-70">
              <CardContent class="p-4 flex items-center justify-between">
                <div>
                  <p class="font-medium">{product.name}</p>
                  <p class="text-sm text-muted-foreground">
                    Beli: Rp {product.priceBuy.toLocaleString('id-ID')} | Jual: Rp {product.priceSell.toLocaleString('id-ID')}
                  </p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </CardContent>
            </Card>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Approved Products -->
    <div>
      <h2 class="font-semibold text-foreground mb-3 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary"></span>
        Produk Aktif ({data.approvedProducts.length})
      </h2>
      {#if data.approvedProducts.length > 0}
        <div class="space-y-2">
          {#each data.approvedProducts as product}
            <Card>
              <CardContent class="p-4 flex items-center justify-between">
                <div>
                  <p class="font-medium">{product.name}</p>
                  <p class="text-sm text-muted-foreground">
                    Beli: Rp {product.priceBuy.toLocaleString('id-ID')} | Jual: Rp {product.priceSell.toLocaleString('id-ID')}
                  </p>
                </div>
                <Badge variant="default">Aktif</Badge>
              </CardContent>
            </Card>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8 text-muted-foreground">
          <p class="text-4xl mb-2">📦</p>
          <p>Belum ada produk yang disetujui</p>
          <p class="text-sm mt-1">Ajukan produk baru untuk mulai berjualan</p>
        </div>
      {/if}
    </div>
  </main>
</div>

<!-- Add Product Modal -->
{#if showAddModal}
  <div class="fixed inset-0 bg-black/50 flex items-end z-50" onclick={() => showAddModal = false}>
    <div class="bg-card w-full rounded-t-2xl p-6 safe-bottom max-h-[80vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Ajukan Produk Baru</h2>
        <Button variant="ghost" size="icon" onclick={() => showAddModal = false}>
          <X class="h-5 w-5" />
        </Button>
      </div>
      <p class="text-muted-foreground text-sm mb-4">Produk akan aktif setelah disetujui admin</p>

      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="space-y-4">
          <div>
            <Label for="productName">Nama Produk</Label>
            <Input id="productName" type="text" bind:value={formName} placeholder="Contoh: Pisang Goreng" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="priceBuy">Harga Setor (Rp)</Label>
              <Input id="priceBuy" type="number" bind:value={formPriceBuy} placeholder="2000" />
              <p class="text-xs text-muted-foreground mt-1">Harga yang Anda terima</p>
            </div>
            <div>
              <Label for="priceSell">Harga Jual (Rp)</Label>
              <Input id="priceSell" type="number" bind:value={formPriceSell} placeholder="3000" />
              <p class="text-xs text-muted-foreground mt-1">Harga jual di toko</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <Button type="button" variant="outline" class="flex-1" onclick={() => showAddModal = false}>
            Batal
          </Button>
          <Button type="submit" class="flex-1" disabled={loading}>
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" />
              Mengajukan...
            {:else}
              Ajukan Produk
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
