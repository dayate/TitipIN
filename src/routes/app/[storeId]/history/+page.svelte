<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ArrowLeft } from 'lucide-svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<div class="p-6">
  <!-- Back Button -->
  <Button variant="ghost" href="/app/{data.storeId}" class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">Riwayat Transaksi</h1>
    <p class="text-muted-foreground">di {data.store?.name}</p>
  </div>

  {#if data.transactions && data.transactions.length > 0}
    <div class="space-y-4">
      {#each data.transactions as tx}
        <Card>
          <CardContent class="pt-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="font-bold">{tx.date}</p>
                <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'verified' ? 'secondary' : 'outline'}>
                  {tx.status === 'completed' ? '✓ Selesai' : tx.status === 'verified' ? '⏳ Terverifikasi' : '📝 Draft'}
                </Badge>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 text-center py-3 bg-accent rounded-lg mb-3">
              <div>
                <p class="text-xl font-bold">{tx.totalItemsIn}</p>
                <p class="text-xs text-muted-foreground">Masuk</p>
              </div>
              <div>
                <p class="text-xl font-bold text-chart-2">{tx.totalItemsSold}</p>
                <p class="text-xs text-muted-foreground">Terjual</p>
              </div>
              <div>
                <p class="text-xl font-bold text-destructive">{tx.totalItemsIn - tx.totalItemsSold}</p>
                <p class="text-xs text-muted-foreground">Sisa</p>
              </div>
            </div>

            {#if tx.status === 'completed'}
              <div class="flex justify-between items-center pt-2 border-t">
                <span class="text-muted-foreground">Pendapatan</span>
                <span class="text-lg font-bold text-primary">
                  Rp {tx.totalPayout.toLocaleString('id-ID')}
                </span>
              </div>
            {/if}

            {#if tx.items && tx.items.length > 0}
              <details class="mt-3">
                <summary class="text-sm text-primary cursor-pointer">Lihat Detail ({tx.items.length} item)</summary>
                <div class="mt-2 space-y-1 text-sm">
                  {#each tx.items as item}
                    <div class="flex justify-between py-1 border-b border-border">
                      <span>{item.productName}</span>
                      <span class="text-muted-foreground">
                        {item.qtyActual} masuk, {item.qtyActual - item.qtyReturned} terjual
                      </span>
                    </div>
                  {/each}
                </div>
              </details>
            {/if}
          </CardContent>
        </Card>
      {/each}
    </div>
  {:else}
    <Card>
      <CardContent class="py-12 text-center">
        <span class="text-4xl mb-4 block">📋</span>
        <p class="text-muted-foreground">Belum ada riwayat transaksi</p>
      </CardContent>
    </Card>
  {/if}
</div>
