<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Loader2, ArrowLeft, Package, Minus, Plus } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();
  let loading = $state(false);

  // Quantity state per product
  let quantities = $state<Record<number, number>>({});

  // Initialize quantities
  $effect(() => {
    if (data.products) {
      data.products.forEach(p => {
        if (quantities[p.id] === undefined) {
          quantities[p.id] = 0;
        }
      });
    }
  });

  function updateQty(productId: number, delta: number) {
    const current = quantities[productId] || 0;
    const newValue = Math.max(0, current + delta);
    quantities[productId] = newValue;
  }

  let totalItems = $derived(
    Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  );

  let itemsToSubmit = $derived(
    Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({
        productId: parseInt(productId),
        qty,
      }))
  );

  async function handleSubmit() {
    if (itemsToSubmit.length === 0) {
      toast.error('Pilih minimal 1 produk untuk disetor');
      return;
    }

    loading = true;

    try {
      const res = await fetch(`/api/stores/${data.storeId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToSubmit,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menyimpan setoran');
        return;
      }

      toast.success('Setoran berhasil disimpan!');
      goto(`/app/${data.storeId}`);
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6">
  <!-- Back Button -->
  <Button variant="ghost" href="/app/{data.storeId}" class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">Setor Barang</h1>
    <p class="text-muted-foreground">di {data.store?.name}</p>
  </div>

  {#if !data.store?.isOpen}
    <Card>
      <CardContent class="py-12 text-center">
        <span class="text-4xl mb-4 block">🔴</span>
        <h3 class="font-semibold mb-2">Lapak Sedang Tutup</h3>
        <p class="text-muted-foreground">Anda tidak bisa menyetor barang saat lapak tutup</p>
      </CardContent>
    </Card>
  {:else if data.products && data.products.length > 0}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-lg">Pilih Produk & Jumlah</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each data.products as product}
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
                <p class="text-sm text-muted-foreground">Rp {product.priceBuy.toLocaleString('id-ID')}/pcs</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                  onclick={() => updateQty(product.id, -1)}
                  disabled={loading}
                >
                  <Minus class="h-4 w-4" />
                </button>
                <Input
                  type="number"
                  class="w-16 text-center"
                  bind:value={quantities[product.id]}
                  min="0"
                  disabled={loading}
                />
                <button
                  type="button"
                  class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                  onclick={() => updateQty(product.id, 1)}
                  disabled={loading}
                >
                  <Plus class="h-4 w-4" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <!-- Submit Section -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">Total Item</span>
          <span class="text-2xl font-bold">{totalItems}</span>
        </div>
        <Button class="w-full" size="lg" onclick={handleSubmit} disabled={loading || totalItems === 0}>
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
            Menyimpan...
          {:else}
            Simpan Setoran
          {/if}
        </Button>
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardContent class="py-12 text-center">
        <Package class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 class="font-semibold mb-2">Belum ada produk</h3>
        <p class="text-muted-foreground mb-4">Ajukan produk terlebih dahulu</p>
        <Button href="/app/{data.storeId}/products">
          Ajukan Produk
        </Button>
      </CardContent>
    </Card>
  {/if}
</div>
