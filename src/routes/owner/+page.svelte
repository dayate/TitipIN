<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Store, Plus, MapPin, Users, Package } from 'lucide-svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<div class="p-6">
  <!-- Page Header -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Dashboard Pemilik</h1>
      <p class="text-muted-foreground">Kelola lapak dan cabang Anda</p>
    </div>
    <Button href="/owner/create-store">
      <Plus class="h-4 w-4 mr-2" />
      Buat Lapak Baru
    </Button>
  </div>

  <!-- Stats Overview -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store class="h-5 w-5 text-primary" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Lapak</p>
            <p class="text-xl font-bold">{data.stores?.length || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
            <MapPin class="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Cabang</p>
            <p class="text-xl font-bold">{data.totalBranches || 0}</p>
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
            <p class="text-sm text-muted-foreground">Total Anggota</p>
            <p class="text-xl font-bold">{data.totalMembers || 0}</p>
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
            <p class="text-sm text-muted-foreground">Total Produk</p>
            <p class="text-xl font-bold">{data.totalProducts || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Store List -->
  <Card>
    <CardHeader>
      <CardTitle>Lapak Saya</CardTitle>
    </CardHeader>
    <CardContent>
      {#if data.stores && data.stores.length > 0}
        <div class="grid gap-4">
          {#each data.stores as store}
            <a
              href="/owner/{store.id}"
              class="block p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {#if store.logoUrl}
                      <img src={store.logoUrl} alt={store.name} class="w-12 h-12 rounded-lg object-cover" />
                    {:else}
                      <Store class="h-6 w-6 text-primary" />
                    {/if}
                  </div>
                  <div>
                    <h3 class="font-semibold">{store.name}</h3>
                    <p class="text-sm text-muted-foreground">{store.description || 'Belum ada deskripsi'}</p>
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={store.isOpen ? 'default' : 'secondary'}>
                        {store.isOpen ? 'Buka' : 'Tutup'}
                      </Badge>
                      <span class="text-xs text-muted-foreground">
                        {store.branchCount || 0} cabang · {store.memberCount || 0} anggota
                      </span>
                      {#if store.inviteCode}
                        <Badge variant="outline" class="font-mono text-xs">
                          🔑 {store.inviteCode}
                        </Badge>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12">
          <Store class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 class="font-semibold mb-2">Belum ada lapak</h3>
          <p class="text-sm text-muted-foreground mb-4">Buat lapak pertama Anda untuk memulai</p>
          <Button href="/owner/create-store">
            <Plus class="h-4 w-4 mr-2" />
            Buat Lapak
          </Button>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
