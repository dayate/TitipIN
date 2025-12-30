<script lang="ts">
  import type { PageData } from './$types';
  import { goto, invalidateAll } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { ArrowLeft, Loader2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();
  let loading = $state(false);

  async function markAllRead() {
    loading = true;
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      toast.success('Semua notifikasi ditandai dibaca');
      await invalidateAll();
    } catch (e) {
      toast.error('Gagal menandai notifikasi');
    } finally {
      loading = false;
    }
  }

  function formatDate(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return d.toLocaleDateString('id-ID');
  }

  function getIcon(type: string) {
    switch (type) {
      case 'product_approved': return '✅';
      case 'product_rejected': return '❌';
      case 'transaction': return '💰';
      case 'warning': return '⚠️';
      case 'success': return '🎉';
      default: return '📢';
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
        <h1 class="text-lg font-bold">Notifikasi</h1>
      </div>
      {#if data.notifications.some(n => !n.isRead)}
        <Button
          variant="ghost"
          size="sm"
          onclick={markAllRead}
          disabled={loading}
        >
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            Tandai semua dibaca
          {/if}
        </Button>
      {/if}
    </div>
  </header>

  <main class="p-4">
    {#if data.notifications.length === 0}
      <div class="text-center py-12 text-muted-foreground">
        <p class="text-4xl mb-2">🔔</p>
        <p>Belum ada notifikasi</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.notifications as notif}
          <Card class={notif.isRead ? 'opacity-60' : 'border-l-4 border-l-primary'}>
            <CardContent class="p-4">
              <div class="flex gap-3">
                <span class="text-xl">{getIcon(notif.type)}</span>
                <div class="flex-1">
                  <p class="font-semibold text-card-foreground">{notif.title}</p>
                  <p class="text-sm text-muted-foreground">{notif.message}</p>
                  <p class="text-xs text-muted-foreground/60 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
                {#if !notif.isRead}
                  <span class="w-2 h-2 rounded-full bg-primary self-start mt-2"></span>
                {/if}
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </main>
</div>
