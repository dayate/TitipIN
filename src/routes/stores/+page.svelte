<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { Store, Search, MapPin, Users, ArrowLeft, Home } from 'lucide-svelte';

  let { data } = $props<{ data: PageData }>();
  let searchQuery = $state('');

  let filteredStores = $derived(
    data.stores?.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || []
  );
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <div class="bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/30 dark:via-background dark:to-background text-white dark:text-foreground p-6 pb-20">
    <div class="flex items-center justify-between mb-4">
      <Button variant="ghost" href="/" class="text-white/80 hover:text-white hover:bg-white/10 dark:text-foreground dark:hover:bg-accent">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Beranda
      </Button>
      <ThemeToggle />
    </div>
    <h1 class="text-2xl font-bold mb-2">Temukan Lapak</h1>
    <p class="text-white/80 dark:text-muted-foreground mb-4">Cari dan gabung ke lapak konsinyasi</p>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari nama lapak..."
        bind:value={searchQuery}
        class="pl-10 bg-white dark:bg-card text-foreground"
      />
    </div>
  </div>

  <!-- Store List -->
  <div class="p-4 -mt-12">
    {#if filteredStores.length > 0}
      <div class="grid gap-4">
        {#each filteredStores as store}
          <Card class="overflow-hidden">
            <a href="/stores/{store.slug}">
              <!-- Banner -->
              <div class="h-24 bg-gradient-to-r from-primary/20 to-primary/10 relative">
                {#if store.bannerUrl}
                  <img src={store.bannerUrl} alt="" class="w-full h-full object-cover" />
                {/if}
                <div class="absolute -bottom-6 left-4">
                  <div class="w-12 h-12 rounded-lg bg-background border-2 border-background flex items-center justify-center shadow">
                    {#if store.logoUrl}
                      <img src={store.logoUrl} alt={store.name} class="w-full h-full rounded-lg object-cover" />
                    {:else}
                      <Store class="h-6 w-6 text-primary" />
                    {/if}
                  </div>
                </div>
              </div>

              <CardContent class="pt-8">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-semibold">{store.name}</h3>
                    <p class="text-sm text-muted-foreground line-clamp-2">
                      {store.description || 'Belum ada deskripsi'}
                    </p>
                  </div>
                  <Badge variant={store.isOpen ? 'default' : 'secondary'}>
                    {store.isOpen ? 'Buka' : 'Tutup'}
                  </Badge>
                </div>

                <div class="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {#if store.mainBranch}
                    <div class="flex items-center gap-1">
                      <MapPin class="h-3 w-3" />
                      <span class="truncate max-w-[150px]">{store.mainBranch}</span>
                    </div>
                  {/if}
                  <div class="flex items-center gap-1">
                    <Users class="h-3 w-3" />
                    <span>{store.memberCount || 0} anggota</span>
                  </div>
                </div>
              </CardContent>
            </a>
          </Card>
        {/each}
      </div>
    {:else}
      <Card>
        <CardContent class="py-12 text-center">
          <Store class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 class="font-semibold mb-2">
            {searchQuery ? 'Tidak ditemukan' : 'Belum ada lapak'}
          </h3>
          <p class="text-sm text-muted-foreground">
            {searchQuery ? 'Coba kata kunci lain' : 'Belum ada lapak yang terdaftar'}
          </p>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>
