<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Loader2, Plus, ArrowLeft, Package, Image, Trash2, Pencil } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  // Form state
  let showForm = $state(false);
  let editingProduct = $state<number | null>(null);
  let name = $state('');
  let description = $state('');
  let priceBuy = $state('');
  let priceSell = $state('');
  let imageUrl = $state('');
  let imageFile = $state<File | null>(null);
  let loading = $state(false);
  let uploading = $state(false);

  function resetForm() {
    name = '';
    description = '';
    priceBuy = '';
    priceSell = '';
    imageUrl = '';
    imageFile = null;
    editingProduct = null;
  }

  function startEdit(product: typeof data.products[0]) {
    editingProduct = product.id;
    name = product.name;
    description = product.description || '';
    priceBuy = product.priceBuy.toString();
    priceSell = product.priceSell.toString();
    imageUrl = product.imageUrl || '';
    showForm = true;
  }

  async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    uploading = true;
    imageFile = file;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'product');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal upload gambar');
        return;
      }

      imageUrl = result.url;
      toast.success('Gambar berhasil diupload');
    } catch (e) {
      toast.error('Gagal upload gambar');
    } finally {
      uploading = false;
    }
  }

  async function handleSubmit() {
    if (!name || !priceBuy || !priceSell) {
      toast.error('Nama dan harga wajib diisi');
      return;
    }

    loading = true;

    try {
      const url = editingProduct
        ? `/api/stores/${data.storeId}/products/${editingProduct}`
        : `/api/stores/${data.storeId}/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          priceBuy: parseInt(priceBuy),
          priceSell: parseInt(priceSell),
          imageUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menyimpan produk');
        return;
      }

      toast.success(editingProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil diajukan!');

      resetForm();
      showForm = false;
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }

  async function handleDeleteImage(productId: number, currentImageUrl: string | null) {
    if (!confirm('Hapus gambar produk ini?')) return;

    try {
      // Delete file from server first
      if (currentImageUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentImageUrl }),
        });
      }

      // Then update product to remove image reference
      const res = await fetch(`/api/stores/${data.storeId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: null }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menghapus gambar');
        return;
      }

      toast.success('Gambar berhasil dihapus');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
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
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold">Produk Saya</h1>
      <p class="text-muted-foreground">di {data.store?.name || 'Lapak'}</p>
    </div>
    {#if !showForm}
      <Button onclick={() => { resetForm(); showForm = true; }}>
        <Plus class="h-4 w-4 mr-2" />
        Ajukan Produk
      </Button>
    {/if}
  </div>

  <!-- Add/Edit Product Form -->
  {#if showForm}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>{editingProduct ? 'Edit Produk' : 'Ajukan Produk Baru'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium mb-2">Foto Produk</label>
            <div class="flex items-center gap-4">
              {#if imageUrl}
                <div class="relative">
                  <img src={imageUrl} alt="Preview" class="w-24 h-24 rounded-lg object-cover" />
                  <button
                    type="button"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    onclick={() => { imageUrl = ''; imageFile = null; }}
                  >
                    <Trash2 class="h-3 w-3" />
                  </button>
                </div>
              {:else}
                <label class="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  {#if uploading}
                    <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
                  {:else}
                    <Image class="h-6 w-6 text-muted-foreground" />
                    <span class="text-xs text-muted-foreground mt-1">Upload</span>
                  {/if}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    onchange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              {/if}
              <p class="text-xs text-muted-foreground">Max 2MB, format JPG/PNG/WebP</p>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium mb-1">Nama Produk *</label>
            <Input id="name" bind:value={name} placeholder="Contoh: Donat Coklat" disabled={loading} />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              id="description"
              bind:value={description}
              placeholder="Deskripsi singkat produk"
              class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading}
            ></textarea>
          </div>

          <!-- Prices -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="priceBuy" class="block text-sm font-medium mb-1">Harga Setor *</label>
              <Input
                id="priceBuy"
                type="number"
                bind:value={priceBuy}
                placeholder="5000"
                disabled={loading}
              />
            </div>
            <div>
              <label for="priceSell" class="block text-sm font-medium mb-1">Harga Jual *</label>
              <Input
                id="priceSell"
                type="number"
                bind:value={priceSell}
                placeholder="7000"
                disabled={loading}
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <Button type="button" variant="outline" onclick={() => { resetForm(); showForm = false; }} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} class="flex-1">
              {#if loading}
                <Loader2 class="h-4 w-4 animate-spin mr-2" />
                {editingProduct ? 'Menyimpan...' : 'Mengajukan...'}
              {:else}
                {editingProduct ? 'Simpan Perubahan' : 'Ajukan Produk'}
              {/if}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  {/if}

  <!-- Products List -->
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">Produk Terdaftar</CardTitle>
    </CardHeader>
    <CardContent>
      {#if data.products && data.products.length > 0}
        <div class="space-y-3">
          {#each data.products as product}
            <div class="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
              <div class="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                {#if product.imageUrl}
                  <img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover" />
                  <!-- Image Actions Overlay -->
                  <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      class="w-7 h-7 rounded-full bg-background flex items-center justify-center"
                      onclick={() => startEdit(product)}
                      title="Ganti gambar"
                    >
                      <Pencil class="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      class="w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      onclick={() => handleDeleteImage(product.id, product.imageUrl)}
                      title="Hapus gambar"
                    >
                      <Trash2 class="h-3 w-3" />
                    </button>
                  </div>
                {:else}
                  <Package class="h-6 w-6 text-muted-foreground" />
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium truncate">{product.name}</h3>
                  <Badge variant={product.status === 'approved' ? 'default' : product.status === 'pending' ? 'secondary' : 'destructive'}>
                    {product.status === 'approved' ? '✓ Disetujui' : product.status === 'pending' ? '⏳ Pending' : '✕ Ditolak'}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Setor: Rp {product.priceBuy.toLocaleString('id-ID')} ·
                  Jual: Rp {product.priceSell.toLocaleString('id-ID')}
                </p>
              </div>
              <Button variant="ghost" size="icon" onclick={() => startEdit(product)}>
                <Pencil class="h-4 w-4" />
              </Button>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8">
          <Package class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p class="text-muted-foreground">Belum ada produk</p>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
