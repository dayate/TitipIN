<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import {
    ArrowLeft, Store, MapPin, Users, Package, Settings,
    Check, X, Clock, Copy, Power
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  async function copyInviteCode() {
    if (data.store?.inviteCode) {
      await navigator.clipboard.writeText(data.store.inviteCode);
      toast.success('Kode invite berhasil disalin!');
    }
  }

  async function handleMemberAction(memberId: number, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/stores/${data.store.id}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          status: action === 'approve' ? 'active' : 'rejected',
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal memproses');
        return;
      }

      toast.success(action === 'approve' ? 'Anggota disetujui!' : 'Permintaan ditolak');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  }

  async function toggleStore() {
    try {
      const res = await fetch(`/api/stores/${data.store.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !data.store.isOpen }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengubah status');
        return;
      }

      toast.success(data.store.isOpen ? 'Lapak ditutup' : 'Lapak dibuka');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  }

  const pendingMembers = $derived(data.members?.filter(m => m.status === 'pending') || []);
  const activeMembers = $derived(data.members?.filter(m => m.status === 'active') || []);
</script>

<div class="p-6">
  <!-- Back Button -->
  <Button variant="ghost" href="/owner" class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <!-- Store Header -->
  <div class="flex items-start justify-between mb-6">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
        {#if data.store?.logoUrl}
          <img src={data.store.logoUrl} alt="" class="w-16 h-16 rounded-xl object-cover" />
        {:else}
          <Store class="h-8 w-8 text-primary" />
        {/if}
      </div>
      <div>
        <h1 class="text-2xl font-bold">{data.store?.name}</h1>
        <div class="flex items-center gap-2 mt-1">
          <Badge variant={data.store?.isOpen ? 'default' : 'secondary'}>
            {data.store?.isOpen ? '🟢 Buka' : '🔴 Tutup'}
          </Badge>
          <span class="text-sm text-muted-foreground">
            {data.store?.openTime} - {data.store?.closeTime}
          </span>
        </div>
      </div>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" onclick={toggleStore}>
        <Power class="h-4 w-4 mr-2" />
        {data.store?.isOpen ? 'Tutup Lapak' : 'Buka Lapak'}
      </Button>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <Button variant="outline" href="/owner/{data.store?.id}/transactions" class="h-auto py-4 flex-col">
      <Clock class="h-6 w-6 mb-2" />
      <span>Validasi Transaksi</span>
    </Button>
    <Button variant="outline" href="/owner/{data.store?.id}/products" class="h-auto py-4 flex-col">
      <Package class="h-6 w-6 mb-2" />
      <span>Kelola Produk</span>
      {#if data.stats?.pendingProducts}
        <Badge variant="destructive" class="mt-1">{data.stats.pendingProducts} pending</Badge>
      {/if}
    </Button>
    <Button variant="outline" href="/owner/{data.store?.id}/settings" class="h-auto py-4 flex-col">
      <Settings class="h-6 w-6 mb-2" />
      <span>Pengaturan</span>
    </Button>
  </div>

  <!-- Invite Code Card -->
  <Card class="mb-6 border-primary/30 bg-primary/5">
    <CardContent class="pt-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Kode Invite (bagikan ke penyetor)</p>
          <p class="text-2xl font-mono font-bold tracking-widest">{data.store?.inviteCode || '-'}</p>
        </div>
        <Button variant="outline" onclick={copyInviteCode}>
          <Copy class="h-4 w-4 mr-2" />
          Salin
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
            <MapPin class="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Cabang</p>
            <p class="text-xl font-bold">{data.branches?.length || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
            <Users class="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Anggota</p>
            <p class="text-xl font-bold">{data.stats?.activeMembers || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-chart-5/20 flex items-center justify-center">
            <Package class="h-5 w-5 text-chart-5" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Produk</p>
            <p class="text-xl font-bold">{data.stats?.totalProducts || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
            <Clock class="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Pending</p>
            <p class="text-xl font-bold">{data.stats?.pendingMembers || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Pending Members -->
  {#if pendingMembers.length > 0}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Clock class="h-5 w-5 text-yellow-500" />
          Permintaan Bergabung ({pendingMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#each pendingMembers as member}
            <div class="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div>
                <p class="font-medium">{member.userName}</p>
                <p class="text-sm text-muted-foreground">{member.userWhatsapp}</p>
                {#if member.requestMessage}
                  <p class="text-sm mt-1 text-muted-foreground italic">"{member.requestMessage}"</p>
                {/if}
              </div>
              <div class="flex gap-2">
                <Button size="sm" variant="outline" onclick={() => handleMemberAction(member.id, 'reject')}>
                  <X class="h-4 w-4" />
                </Button>
                <Button size="sm" onclick={() => handleMemberAction(member.id, 'approve')}>
                  <Check class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Active Members -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Anggota Aktif ({activeMembers.length})</CardTitle>
    </CardHeader>
    <CardContent>
      {#if activeMembers.length > 0}
        <div class="space-y-2">
          {#each activeMembers as member}
            <div class="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div>
                <p class="font-medium">{member.userName}</p>
                <p class="text-sm text-muted-foreground">{member.userWhatsapp}</p>
              </div>
              <Badge variant="default">Aktif</Badge>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-muted-foreground py-4">Belum ada anggota</p>
      {/if}
    </CardContent>
  </Card>

  <!-- Branches -->
  <Card>
    <CardHeader>
      <CardTitle>Cabang ({data.branches?.length || 0})</CardTitle>
    </CardHeader>
    <CardContent>
      {#if data.branches && data.branches.length > 0}
        <div class="space-y-2">
          {#each data.branches as branch}
            <div class="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
              <MapPin class="h-4 w-4 mt-1 text-primary shrink-0" />
              <div>
                <p class="font-medium">{branch.name}</p>
                <p class="text-sm text-muted-foreground">{branch.address}</p>
                {#if branch.phone}
                  <p class="text-sm text-muted-foreground">{branch.phone}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-muted-foreground py-4">Belum ada cabang</p>
      {/if}
    </CardContent>
  </Card>
</div>
