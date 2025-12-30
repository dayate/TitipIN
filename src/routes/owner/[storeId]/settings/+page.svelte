<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { ArrowLeft, Loader2, Copy, RefreshCw } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let name = $state(data.store?.name || '');
  let description = $state(data.store?.description || '');
  let openTime = $state(data.store?.openTime || '05:00');
  let closeTime = $state(data.store?.closeTime || '10:00');
  let announcement = $state(data.store?.announcement || '');
  let loading = $state(false);

  async function copyInviteCode() {
    if (data.store?.inviteCode) {
      await navigator.clipboard.writeText(data.store.inviteCode);
      toast.success('Kode invite berhasil disalin!');
    }
  }

  async function regenerateInviteCode() {
    try {
      const res = await fetch(`/api/stores/${data.storeId}/regenerate-code`, {
        method: 'POST',
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal regenerate kode');
        return;
      }

      toast.success('Kode invite baru berhasil dibuat!');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  }

  async function handleSubmit() {
    loading = true;

    try {
      const res = await fetch(`/api/stores/${data.storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          openTime,
          closeTime,
          announcement,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menyimpan');
        return;
      }

      toast.success('Pengaturan berhasil disimpan!');
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">Pengaturan Lapak</h1>
    <p class="text-muted-foreground">{data.store?.name}</p>
  </div>

  <!-- Invite Code -->
  <Card class="mb-6 border-primary/30 bg-primary/5">
    <CardHeader>
      <CardTitle>Kode Invite</CardTitle>
      <CardDescription>Bagikan kode ini ke penyetor untuk join langsung</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex items-center gap-3">
        <div class="flex-1 text-3xl font-mono font-bold tracking-widest">
          {data.store?.inviteCode || '-'}
        </div>
        <Button variant="outline" onclick={copyInviteCode}>
          <Copy class="h-4 w-4" />
        </Button>
        <Button variant="outline" onclick={regenerateInviteCode}>
          <RefreshCw class="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Store Settings Form -->
  <Card>
    <CardHeader>
      <CardTitle>Informasi Lapak</CardTitle>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-1">Nama Lapak</label>
          <Input id="name" bind:value={name} disabled={loading} />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            id="description"
            bind:value={description}
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="openTime" class="block text-sm font-medium mb-1">Jam Buka</label>
            <Input id="openTime" type="time" bind:value={openTime} disabled={loading} />
          </div>
          <div>
            <label for="closeTime" class="block text-sm font-medium mb-1">Jam Tutup</label>
            <Input id="closeTime" type="time" bind:value={closeTime} disabled={loading} />
          </div>
        </div>

        <div>
          <label for="announcement" class="block text-sm font-medium mb-1">Pengumuman</label>
          <textarea
            id="announcement"
            bind:value={announcement}
            placeholder="Tulis pengumuman untuk anggota lapak..."
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          ></textarea>
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
          {/if}
          Simpan Pengaturan
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
