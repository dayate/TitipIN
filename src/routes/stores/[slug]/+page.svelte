<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Loader2, Store, MapPin, Clock, Users, ArrowLeft, Key } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();
  let requestMessage = $state('');
  let inviteCode = $state('');
  let loading = $state(false);
  let showJoinForm = $state(false);
  let joinMode = $state<'invite' | 'request'>('invite');

  async function handleJoinRequest() {
    if (!data.user) {
      toast.error('Silakan login terlebih dahulu');
      goto('/auth/login');
      return;
    }

    loading = true;

    try {
      const res = await fetch(`/api/stores/${data.store.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: requestMessage,
          inviteCode: joinMode === 'invite' ? inviteCode : undefined
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengirim permintaan');
        return;
      }

      if (result.autoApproved) {
        toast.success('Berhasil bergabung ke lapak!');
        goto('/app');
      } else {
        toast.success('Permintaan gabung berhasil dikirim!');
        showJoinForm = false;
      }
    } catch (e) {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Back Button -->
  <div class="p-4">
    <Button variant="ghost" href="/stores">
      <ArrowLeft class="h-4 w-4 mr-2" />
      Kembali
    </Button>
  </div>

  {#if data.store}
    <!-- Store Header -->
    <div class="relative">
      <div class="h-32 bg-gradient-to-r from-primary/20 to-primary/10">
        {#if data.store.bannerUrl}
          <img src={data.store.bannerUrl} alt="" class="w-full h-full object-cover" />
        {/if}
      </div>
      <div class="absolute -bottom-8 left-4">
        <div class="w-16 h-16 rounded-xl bg-background border-4 border-background flex items-center justify-center shadow-lg">
          {#if data.store.logoUrl}
            <img src={data.store.logoUrl} alt={data.store.name} class="w-full h-full rounded-xl object-cover" />
          {:else}
            <Store class="h-8 w-8 text-primary" />
          {/if}
        </div>
      </div>
      <div class="absolute top-4 right-4">
        <Badge variant={data.store.isOpen ? 'default' : 'secondary'} class="text-sm">
          {data.store.isOpen ? '🟢 Buka' : '🔴 Tutup'}
        </Badge>
      </div>
    </div>

    <!-- Store Info -->
    <div class="p-4 pt-12">
      <h1 class="text-2xl font-bold">{data.store.name}</h1>
      <p class="text-muted-foreground mt-1">{data.store.description || 'Belum ada deskripsi'}</p>

      <!-- Stats -->
      <div class="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-1">
          <Clock class="h-4 w-4" />
          <span>{data.store.openTime} - {data.store.closeTime}</span>
        </div>
        <div class="flex items-center gap-1">
          <Users class="h-4 w-4" />
          <span>{data.memberCount || 0} anggota</span>
        </div>
      </div>

      <!-- Announcement -->
      {#if data.store.announcement}
        <div class="mt-4 p-3 bg-accent rounded-lg">
          <div class="flex items-start gap-2">
            <span>📢</span>
            <p class="text-sm">{data.store.announcement}</p>
          </div>
        </div>
      {/if}

      <!-- Branches -->
      {#if data.branches && data.branches.length > 0}
        <Card class="mt-6">
          <CardHeader>
            <CardTitle class="text-lg">Lokasi Cabang</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            {#each data.branches as branch}
              <div class="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <MapPin class="h-4 w-4 mt-1 text-primary shrink-0" />
                <div>
                  <p class="font-medium text-sm">{branch.name}</p>
                  <p class="text-xs text-muted-foreground">{branch.address}</p>
                  {#if branch.phone}
                    <p class="text-xs text-muted-foreground">{branch.phone}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </CardContent>
        </Card>
      {/if}

      <!-- Join Section -->
      {#if data.user}
        {#if data.membershipStatus === 'active'}
          <div class="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
            <p class="text-green-600 dark:text-green-400 font-medium">✓ Anda sudah menjadi anggota lapak ini</p>
            <Button href="/app/{data.store.id}" class="mt-2" variant="outline">
              Buka Dashboard
            </Button>
          </div>
        {:else if data.membershipStatus === 'pending'}
          <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center">
            <p class="text-yellow-600 dark:text-yellow-400 font-medium">⏳ Permintaan gabung menunggu persetujuan</p>
          </div>
        {:else if data.user.role === 'supplier'}
          {#if showJoinForm}
            <Card class="mt-6">
              <CardHeader>
                <CardTitle class="text-lg">Gabung ke Lapak</CardTitle>
              </CardHeader>
              <CardContent>
                <!-- Join Mode Tabs -->
                <div class="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={joinMode === 'invite' ? 'default' : 'outline'}
                    size="sm"
                    onclick={() => joinMode = 'invite'}
                  >
                    <Key class="h-4 w-4 mr-1" />
                    Kode Invite
                  </Button>
                  <Button
                    type="button"
                    variant={joinMode === 'request' ? 'default' : 'outline'}
                    size="sm"
                    onclick={() => joinMode = 'request'}
                  >
                    Ajukan Manual
                  </Button>
                </div>

                <form onsubmit={(e) => { e.preventDefault(); handleJoinRequest(); }}>
                  {#if joinMode === 'invite'}
                    <div class="mb-4">
                      <label for="inviteCode" class="block text-sm font-medium mb-1">Kode Invite</label>
                      <Input
                        id="inviteCode"
                        bind:value={inviteCode}
                        placeholder="Masukkan kode 6 karakter"
                        class="uppercase"
                        maxlength={6}
                        disabled={loading}
                      />
                      <p class="text-xs text-muted-foreground mt-1">Minta kode invite dari pemilik lapak untuk langsung bergabung</p>
                    </div>
                  {:else}
                    <div class="mb-4">
                      <label for="message" class="block text-sm font-medium mb-1">Pesan Permohonan</label>
                      <textarea
                        id="message"
                        bind:value={requestMessage}
                        placeholder="Ceritakan tentang produk yang ingin Anda titipkan..."
                        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={loading}
                      ></textarea>
                      <p class="text-xs text-muted-foreground mt-1">Permintaan akan diproses oleh pemilik lapak</p>
                    </div>
                  {/if}
                  <div class="flex gap-2">
                    <Button type="button" variant="outline" onclick={() => showJoinForm = false} disabled={loading}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading || (joinMode === 'invite' && !inviteCode)} class="flex-1">
                      {#if loading}
                        <Loader2 class="h-4 w-4 animate-spin mr-2" />
                        Memproses...
                      {:else}
                        {joinMode === 'invite' ? 'Gabung' : 'Kirim Permintaan'}
                      {/if}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          {:else}
            <Button class="w-full mt-6" size="lg" onclick={() => showJoinForm = true}>
              Gabung ke Lapak Ini
            </Button>
          {/if}
        {/if}
      {:else}
        <Button class="w-full mt-6" size="lg" href="/auth/login">
          Login untuk Gabung
        </Button>
      {/if}
    </div>
  {:else}
    <div class="p-4 text-center">
      <p class="text-muted-foreground">Lapak tidak ditemukan</p>
    </div>
  {/if}
</div>
