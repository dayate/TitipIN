<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Loader2, ArrowLeft, User, Image, Trash2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let name = $state(data.profile?.name || '');
  let bio = $state(data.profile?.bio || '');
  let address = $state(data.profile?.address || '');
  let avatarUrl = $state(data.profile?.avatarUrl || '');
  let loading = $state(false);
  let uploading = $state(false);

  async function handleAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    uploading = true;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal upload foto');
        return;
      }

      avatarUrl = result.url;
      toast.success('Foto berhasil diupload');
    } catch (e) {
      toast.error('Gagal upload foto');
    } finally {
      uploading = false;
    }
  }

  async function handleSubmit() {
    if (!name) {
      toast.error('Nama wajib diisi');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, address, avatarUrl }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menyimpan');
        return;
      }

      toast.success('Profil berhasil diperbarui!');
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6 max-w-xl mx-auto">
  <!-- Back Button -->
  <Button variant="ghost" href={data.profile?.role === 'owner' ? '/owner' : '/app'} class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <Card>
    <CardHeader>
      <CardTitle>Edit Profil</CardTitle>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
        <!-- Avatar -->
        <div class="flex flex-col items-center">
          <div class="relative mb-3">
            {#if avatarUrl}
              <img src={avatarUrl} alt="" class="w-24 h-24 rounded-full object-cover" />
              <button
                type="button"
                class="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                onclick={() => avatarUrl = ''}
              >
                <Trash2 class="h-3 w-3" />
              </button>
            {:else}
              <label class="w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                {#if uploading}
                  <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
                {:else}
                  <User class="h-8 w-8 text-muted-foreground" />
                {/if}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  onchange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            {/if}
          </div>
          <p class="text-xs text-muted-foreground">Klik untuk ganti foto</p>
        </div>

        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium mb-1">Nama Lengkap *</label>
          <Input id="name" bind:value={name} placeholder="Nama Anda" disabled={loading} />
        </div>

        <!-- Bio -->
        <div>
          <label for="bio" class="block text-sm font-medium mb-1">Bio</label>
          <textarea
            id="bio"
            bind:value={bio}
            placeholder="Ceritakan tentang diri Anda"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          ></textarea>
        </div>

        <!-- Address -->
        <div>
          <label for="address" class="block text-sm font-medium mb-1">Alamat</label>
          <textarea
            id="address"
            bind:value={address}
            placeholder="Alamat lengkap"
            class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          ></textarea>
        </div>

        <!-- Info -->
        <div class="p-4 bg-muted rounded-lg">
          <p class="text-sm"><strong>WhatsApp:</strong> {data.profile?.whatsapp}</p>
          <p class="text-sm"><strong>Role:</strong> {data.profile?.role === 'owner' ? 'Pemilik Lapak' : 'Penyetor'}</p>
        </div>

        <!-- Submit -->
        <Button type="submit" class="w-full" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
          {/if}
          Simpan Perubahan
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
