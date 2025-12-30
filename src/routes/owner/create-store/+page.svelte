<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Loader2, ArrowLeft, Store } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let name = $state('');
  let description = $state('');
  let address = $state('');
  let phone = $state('');
  let openTime = $state('05:00');
  let closeTime = $state('10:00');
  let loading = $state(false);

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  let slug = $derived(generateSlug(name));

  async function handleSubmit() {
    if (!name || !address) {
      toast.error('Nama lapak dan alamat wajib diisi');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          address,
          phone,
          openTime,
          closeTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal membuat lapak');
        return;
      }

      toast.success('Lapak berhasil dibuat!');
      goto(`/owner/${data.store.id}`);
    } catch (e) {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6 max-w-2xl mx-auto">
  <!-- Back Button -->
  <Button variant="ghost" href="/owner" class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <Card>
    <CardHeader>
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Store class="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle>Buat Lapak Baru</CardTitle>
          <CardDescription>Isi informasi lapak dan cabang utama</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <!-- Store Name -->
        <div>
          <label for="name" class="block text-sm font-medium mb-1">Nama Lapak *</label>
          <Input
            id="name"
            bind:value={name}
            placeholder="Contoh: Lapak Mak Unyil"
            disabled={loading}
          />
          {#if slug}
            <p class="text-xs text-muted-foreground mt-1">URL: /stores/{slug}</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Deskripsi singkat tentang lapak Anda"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          ></textarea>
        </div>

        <hr class="my-4" />

        <h3 class="font-medium">Cabang Utama</h3>

        <!-- Address -->
        <div>
          <label for="address" class="block text-sm font-medium mb-1">Alamat Lengkap *</label>
          <textarea
            id="address"
            bind:value={address}
            placeholder="Jl. Contoh No. 123, Kecamatan, Kota"
            class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          ></textarea>
        </div>

        <!-- Phone -->
        <div>
          <label for="phone" class="block text-sm font-medium mb-1">Nomor Telepon</label>
          <Input
            id="phone"
            type="tel"
            bind:value={phone}
            placeholder="08xxxxxxxxxx"
            disabled={loading}
          />
        </div>

        <!-- Operating Hours -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="openTime" class="block text-sm font-medium mb-1">Jam Buka</label>
            <Input
              id="openTime"
              type="time"
              bind:value={openTime}
              disabled={loading}
            />
          </div>
          <div>
            <label for="closeTime" class="block text-sm font-medium mb-1">Jam Tutup</label>
            <Input
              id="closeTime"
              type="time"
              bind:value={closeTime}
              disabled={loading}
            />
          </div>
        </div>

        <!-- Submit Button -->
        <Button type="submit" class="w-full" size="lg" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
            Membuat lapak...
          {:else}
            Buat Lapak
          {/if}
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
