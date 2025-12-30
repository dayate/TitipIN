<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
  } from '$lib/components/ui/dialog';
  import {
    Megaphone, Plus, Trash2, Bell, Info, AlertTriangle, CheckCircle, Users
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let isLoading = $state(false);
  let showCreateDialog = $state(false);

  // Form states
  let newTitle = $state('');
  let newMessage = $state('');
  let newType = $state<'info' | 'warning' | 'success'>('info');

  async function createAnnouncement() {
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error('Judul dan pesan wajib diisi');
      return;
    }

    isLoading = true;
    try {
      const res = await fetch(`/api/stores/${data.storeId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          message: newMessage,
          type: newType,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal membuat pengumuman');
        return;
      }

      toast.success(result.message || 'Pengumuman berhasil dikirim!');
      showCreateDialog = false;
      newTitle = '';
      newMessage = '';
      newType = 'info';
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  async function deleteAnnouncement(announcementId: number) {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;

    isLoading = true;
    try {
      const res = await fetch(`/api/stores/${data.storeId}/announcements`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menghapus');
        return;
      }

      toast.success('Pengumuman berhasil dihapus');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case 'warning':
        return { variant: 'destructive' as const, label: 'Peringatan' };
      case 'success':
        return { variant: 'default' as const, label: 'Sukses' };
      default:
        return { variant: 'secondary' as const, label: 'Info' };
    }
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Filter only store-level announcements (without userId)
  const storeAnnouncements = $derived(
    data.announcements?.filter(a => !a.userId) || []
  );
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <Megaphone class="h-6 w-6" />
        Pengumuman
      </h1>
      <p class="text-muted-foreground">{data.store?.name}</p>
    </div>
    <Button onclick={() => showCreateDialog = true}>
      <Plus class="h-4 w-4 mr-2" />
      Buat Pengumuman
    </Button>
  </div>

  <!-- Info Card -->
  <Card class="mb-6 border-green-500/30 bg-green-500/5">
    <CardContent class="pt-4">
      <div class="flex items-center gap-3">
        <Users class="h-5 w-5 text-green-500" />
        <p class="text-sm">
          Pengumuman akan dikirim ke <strong>{data.memberCount}</strong> anggota aktif
        </p>
      </div>
    </CardContent>
  </Card>

  <!-- Announcements List -->
  {#if storeAnnouncements.length > 0}
    <div class="space-y-4">
      {#each storeAnnouncements as announcement}
        {@const badge = getTypeBadge(announcement.type)}
        {@const Icon = getTypeIcon(announcement.type)}
        <Card>
          <CardHeader class="pb-2">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <CardTitle class="text-base">{announcement.title}</CardTitle>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onclick={() => deleteAnnouncement(announcement.id)}
                disabled={isLoading}
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">{announcement.message}</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  {:else}
    <Card>
      <CardContent class="py-12 text-center">
        <Bell class="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p class="text-muted-foreground">Belum ada pengumuman</p>
        <Button class="mt-4" onclick={() => showCreateDialog = true}>
          <Plus class="h-4 w-4 mr-2" />
          Buat Pengumuman Pertama
        </Button>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Create Dialog -->
<Dialog bind:open={showCreateDialog}>
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>Buat Pengumuman Baru</DialogTitle>
    </DialogHeader>
    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="title">Judul</Label>
        <Input id="title" bind:value={newTitle} placeholder="Judul pengumuman..." />
      </div>
      <div class="space-y-2">
        <Label for="message">Pesan</Label>
        <textarea
          id="message"
          bind:value={newMessage}
          placeholder="Tulis pesan pengumuman..."
          rows="4"
          class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ></textarea>
      </div>
      <div class="space-y-2">
        <Label>Tipe</Label>
        <div class="flex gap-2">
          <Button
            variant={newType === 'info' ? 'default' : 'outline'}
            size="sm"
            onclick={() => newType = 'info'}
          >
            <Info class="h-4 w-4 mr-1" />
            Info
          </Button>
          <Button
            variant={newType === 'success' ? 'default' : 'outline'}
            size="sm"
            onclick={() => newType = 'success'}
          >
            <CheckCircle class="h-4 w-4 mr-1" />
            Sukses
          </Button>
          <Button
            variant={newType === 'warning' ? 'default' : 'outline'}
            size="sm"
            onclick={() => newType = 'warning'}
          >
            <AlertTriangle class="h-4 w-4 mr-1" />
            Peringatan
          </Button>
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onclick={() => showCreateDialog = false}>
        Batal
      </Button>
      <Button onclick={createAnnouncement} disabled={isLoading}>
        {isLoading ? 'Mengirim...' : 'Kirim Pengumuman'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
