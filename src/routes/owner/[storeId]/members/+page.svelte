<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import {
    Users, UserPlus, UserMinus, Check, X, Clock, Copy, Link,
    Search, Filter, User
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let searchQuery = $state('');
  let filterStatus = $state<'all' | 'pending' | 'active' | 'suspended'>('all');
  let isLoading = $state(false);

  const filteredMembers = $derived(() => {
    let result = data.members || [];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(m => m.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.userName?.toLowerCase().includes(query) ||
        m.userWhatsapp?.toLowerCase().includes(query)
      );
    }

    return result;
  });

  const stats = $derived({
    total: data.members?.length || 0,
    active: data.members?.filter(m => m.status === 'active').length || 0,
    pending: data.members?.filter(m => m.status === 'pending').length || 0,
    suspended: data.members?.filter(m => m.status === 'suspended').length || 0,
  });

  async function copyInviteCode() {
    if (data.store?.inviteCode) {
      await navigator.clipboard.writeText(data.store.inviteCode);
      toast.success('Kode invite berhasil disalin!');
    }
  }

  async function copyInviteUrl() {
    if (data.inviteUrl) {
      await navigator.clipboard.writeText(data.inviteUrl);
      toast.success('Link invite berhasil disalin!');
    }
  }

  async function handleMemberAction(memberId: number, action: 'approve' | 'reject' | 'suspend' | 'activate') {
    isLoading = true;
    try {
      const statusMap = {
        approve: 'active',
        reject: 'rejected',
        suspend: 'suspended',
        activate: 'active',
      };

      const res = await fetch(`/api/stores/${data.storeId}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          status: statusMap[action],
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal memproses');
        return;
      }

      toast.success(result.message || 'Berhasil!');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  async function kickMember(memberId: number, memberName: string) {
    if (!confirm(`Yakin ingin menghapus ${memberName} dari lapak?`)) return;

    isLoading = true;
    try {
      const res = await fetch(`/api/stores/${data.storeId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menghapus');
        return;
      }

      toast.success('Anggota berhasil dihapus');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, label: 'Aktif' };
      case 'pending':
        return { variant: 'secondary' as const, label: 'Pending' };
      case 'suspended':
        return { variant: 'destructive' as const, label: 'Ditangguhkan' };
      case 'rejected':
        return { variant: 'outline' as const, label: 'Ditolak' };
      default:
        return { variant: 'outline' as const, label: status };
    }
  }
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold flex items-center gap-2">
      <Users class="h-6 w-6" />
      Kelola Anggota
    </h1>
    <p class="text-muted-foreground">{data.store?.name}</p>
  </div>

  <!-- Invite Section -->
  <Card class="mb-6 border-primary/30 bg-primary/5">
    <CardHeader class="pb-2">
      <CardTitle class="text-base flex items-center gap-2">
        <UserPlus class="h-4 w-4" />
        Undang Anggota Baru
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <!-- Invite Code -->
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <p class="text-xs text-muted-foreground mb-1">Kode Invite</p>
          <div class="flex items-center gap-2">
            <code class="px-3 py-2 bg-background rounded-lg font-mono text-lg tracking-widest flex-1">
              {data.store?.inviteCode || '-'}
            </code>
            <Button variant="outline" size="sm" onclick={copyInviteCode}>
              <Copy class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Invite URL -->
      {#if data.inviteUrl}
        <div>
          <p class="text-xs text-muted-foreground mb-1">Link Invite</p>
          <div class="flex items-center gap-2">
            <Input value={data.inviteUrl} readonly class="text-sm" />
            <Button variant="outline" size="sm" onclick={copyInviteUrl}>
              <Link class="h-4 w-4" />
            </Button>
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card class="cursor-pointer hover:border-primary/50" onclick={() => filterStatus = 'all'}>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold">{stats.total}</p>
        <p class="text-sm text-muted-foreground">Total</p>
      </CardContent>
    </Card>
    <Card class="cursor-pointer hover:border-primary/50" onclick={() => filterStatus = 'active'}>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold text-green-500">{stats.active}</p>
        <p class="text-sm text-muted-foreground">Aktif</p>
      </CardContent>
    </Card>
    <Card class="cursor-pointer hover:border-primary/50" onclick={() => filterStatus = 'pending'}>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        <p class="text-sm text-muted-foreground">Pending</p>
      </CardContent>
    </Card>
    <Card class="cursor-pointer hover:border-primary/50" onclick={() => filterStatus = 'suspended'}>
      <CardContent class="pt-4 text-center">
        <p class="text-2xl font-bold text-red-500">{stats.suspended}</p>
        <p class="text-sm text-muted-foreground">Ditangguhkan</p>
      </CardContent>
    </Card>
  </div>

  <!-- Search & Filter -->
  <div class="flex flex-col sm:flex-row gap-3 mb-4">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Cari nama atau nomor WA..."
        class="pl-10"
        bind:value={searchQuery}
      />
    </div>
    <div class="flex gap-2">
      <Button
        variant={filterStatus === 'all' ? 'default' : 'outline'}
        size="sm"
        onclick={() => filterStatus = 'all'}
      >
        Semua
      </Button>
      <Button
        variant={filterStatus === 'pending' ? 'default' : 'outline'}
        size="sm"
        onclick={() => filterStatus = 'pending'}
      >
        Pending
      </Button>
      <Button
        variant={filterStatus === 'active' ? 'default' : 'outline'}
        size="sm"
        onclick={() => filterStatus = 'active'}
      >
        Aktif
      </Button>
    </div>
  </div>

  <!-- Members List -->
  <Card>
    <CardHeader>
      <CardTitle>
        Daftar Anggota ({filteredMembers().length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {#if filteredMembers().length > 0}
        <div class="space-y-3">
          {#each filteredMembers() as member}
            {@const badge = getStatusBadge(member.status)}
            <div class="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {#if member.userAvatar}
                  <img src={member.userAvatar} alt="" class="w-full h-full object-cover" />
                {:else}
                  <User class="h-5 w-5 text-muted-foreground" />
                {/if}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">{member.userName}</p>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                <p class="text-sm text-muted-foreground">{member.userWhatsapp}</p>
                {#if member.requestMessage}
                  <p class="text-sm text-muted-foreground italic mt-1">"{member.requestMessage}"</p>
                {/if}
                {#if member.joinedAt}
                  <p class="text-xs text-muted-foreground mt-1">
                    Bergabung: {new Date(member.joinedAt).toLocaleDateString('id-ID')}
                  </p>
                {/if}
              </div>

              <!-- Actions -->
              <div class="flex gap-2 shrink-0">
                {#if member.status === 'pending'}
                  <Button
                    size="sm"
                    variant="outline"
                    onclick={() => handleMemberAction(member.id, 'reject')}
                    disabled={isLoading}
                  >
                    <X class="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onclick={() => handleMemberAction(member.id, 'approve')}
                    disabled={isLoading}
                  >
                    <Check class="h-4 w-4" />
                  </Button>
                {:else if member.status === 'active'}
                  <Button
                    size="sm"
                    variant="outline"
                    onclick={() => handleMemberAction(member.id, 'suspend')}
                    disabled={isLoading}
                  >
                    <Clock class="h-4 w-4 mr-1" />
                    Tangguhkan
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onclick={() => kickMember(member.id, member.userName)}
                    disabled={isLoading}
                  >
                    <UserMinus class="h-4 w-4" />
                  </Button>
                {:else if member.status === 'suspended'}
                  <Button
                    size="sm"
                    onclick={() => handleMemberAction(member.id, 'activate')}
                    disabled={isLoading}
                  >
                    <Check class="h-4 w-4 mr-1" />
                    Aktifkan
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onclick={() => kickMember(member.id, member.userName)}
                    disabled={isLoading}
                  >
                    <UserMinus class="h-4 w-4" />
                  </Button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8 text-muted-foreground">
          <Users class="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada anggota{filterStatus !== 'all' ? ` dengan status "${filterStatus}"` : ''}</p>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
