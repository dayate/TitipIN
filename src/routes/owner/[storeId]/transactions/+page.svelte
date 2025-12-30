<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import {
    ArrowLeft, Check, Clock, Package, User,
    ChevronDown, ChevronUp, Loader2, X
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();
  let loading = $state<number | null>(null);
  let expandedTx = $state<number | null>(null);

  // State for editing quantities
  let editingItems = $state<Record<number, { qtyActual: number; qtyReturned: number }>>({});

  function toggleExpand(txId: number) {
    if (expandedTx === txId) {
      expandedTx = null;
    } else {
      expandedTx = txId;
      // Initialize editing values if not set
      const tx = data.transactions.find(t => t.id === txId);
      if (tx && tx.items) {
        tx.items.forEach(item => {
          if (!editingItems[item.id]) {
            editingItems[item.id] = {
              qtyActual: item.qtyActual || item.qtyPlanned,
              qtyReturned: item.qtyReturned || 0,
            };
          }
        });
      }
    }
  }

  async function handleVerify(txId: number) {
    const tx = data.transactions.find(t => t.id === txId);
    if (!tx) return;

    loading = txId;

    try {
      // Prepare items data with actual quantities
      const itemsData = tx.items.map(item => ({
        id: item.id,
        qtyActual: editingItems[item.id]?.qtyActual ?? item.qtyPlanned,
      }));

      const res = await fetch(`/api/stores/${data.storeId}/transactions/${txId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsData }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal memverifikasi');
        return;
      }

      toast.success('Transaksi berhasil diverifikasi!');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = null;
    }
  }

  async function handleComplete(txId: number) {
    const tx = data.transactions.find(t => t.id === txId);
    if (!tx) return;

    loading = txId;

    try {
      // Prepare items data with returned quantities
      const itemsData = tx.items.map(item => ({
        id: item.id,
        qtyReturned: editingItems[item.id]?.qtyReturned ?? 0,
      }));

      const res = await fetch(`/api/stores/${data.storeId}/transactions/${txId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsData }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menyelesaikan');
        return;
      }

      toast.success('Transaksi selesai!');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = null;
    }
  }

  const draftTransactions = $derived(data.transactions?.filter(t => t.status === 'draft') || []);
  const verifiedTransactions = $derived(data.transactions?.filter(t => t.status === 'verified') || []);
  const completedTransactions = $derived(data.transactions?.filter(t => t.status === 'completed') || []);
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">Validasi Transaksi</h1>
    <p class="text-muted-foreground">{data.store?.name}</p>
  </div>

  <!-- Draft Transactions (Need Verification) -->
  {#if draftTransactions.length > 0}
    <Card class="mb-6 border-yellow-500/50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-yellow-600">
          <Clock class="h-5 w-5" />
          Perlu Verifikasi ({draftTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each draftTransactions as tx}
            <div class="border rounded-lg overflow-hidden">
              <button
                type="button"
                class="w-full flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                onclick={() => toggleExpand(tx.id)}
              >
                <div class="flex items-center gap-3">
                  <User class="h-5 w-5 text-muted-foreground" />
                  <div class="text-left">
                    <p class="font-medium">{tx.supplierName}</p>
                    <p class="text-sm text-muted-foreground">{tx.date} • {tx.totalItemsIn} item</p>
                  </div>
                </div>
                {#if expandedTx === tx.id}
                  <ChevronUp class="h-5 w-5" />
                {:else}
                  <ChevronDown class="h-5 w-5" />
                {/if}
              </button>

              {#if expandedTx === tx.id}
                <div class="p-4 border-t">
                  <p class="text-sm text-muted-foreground mb-3">
                    Input jumlah aktual yang diterima:
                  </p>
                  <div class="space-y-3">
                    {#each tx.items as item}
                      <div class="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                        <Package class="h-5 w-5 text-muted-foreground shrink-0" />
                        <div class="flex-1 min-w-0">
                          <p class="font-medium truncate">{item.productName}</p>
                          <p class="text-sm text-muted-foreground">
                            Rencana: {item.qtyPlanned} pcs
                          </p>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-muted-foreground">Aktual:</span>
                          <Input
                            type="number"
                            class="w-20 text-center"
                            min="0"
                            max={item.qtyPlanned}
                            bind:value={editingItems[item.id].qtyActual}
                            disabled={loading === tx.id}
                          />
                        </div>
                      </div>
                    {/each}
                  </div>
                  <div class="flex justify-end gap-2 mt-4">
                    <Button
                      onclick={() => handleVerify(tx.id)}
                      disabled={loading === tx.id}
                    >
                      {#if loading === tx.id}
                        <Loader2 class="h-4 w-4 animate-spin mr-2" />
                      {:else}
                        <Check class="h-4 w-4 mr-2" />
                      {/if}
                      Verifikasi
                    </Button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Verified Transactions (Need Completion) -->
  {#if verifiedTransactions.length > 0}
    <Card class="mb-6 border-blue-500/50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-blue-600">
          <Clock class="h-5 w-5" />
          Menunggu Retur ({verifiedTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each verifiedTransactions as tx}
            <div class="border rounded-lg overflow-hidden">
              <button
                type="button"
                class="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                onclick={() => toggleExpand(tx.id)}
              >
                <div class="flex items-center gap-3">
                  <User class="h-5 w-5 text-muted-foreground" />
                  <div class="text-left">
                    <p class="font-medium">{tx.supplierName}</p>
                    <p class="text-sm text-muted-foreground">{tx.date} • {tx.totalItemsIn} item diterima</p>
                  </div>
                </div>
                {#if expandedTx === tx.id}
                  <ChevronUp class="h-5 w-5" />
                {:else}
                  <ChevronDown class="h-5 w-5" />
                {/if}
              </button>

              {#if expandedTx === tx.id}
                <div class="p-4 border-t">
                  <p class="text-sm text-muted-foreground mb-3">
                    Input jumlah barang yang dikembalikan (sisa):
                  </p>
                  <div class="space-y-3">
                    {#each tx.items as item}
                      <div class="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                        <Package class="h-5 w-5 text-muted-foreground shrink-0" />
                        <div class="flex-1 min-w-0">
                          <p class="font-medium truncate">{item.productName}</p>
                          <p class="text-sm text-muted-foreground">
                            Diterima: {item.qtyActual} pcs
                          </p>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-muted-foreground">Retur:</span>
                          <Input
                            type="number"
                            class="w-20 text-center"
                            min="0"
                            max={item.qtyActual}
                            bind:value={editingItems[item.id].qtyReturned}
                            disabled={loading === tx.id}
                          />
                        </div>
                      </div>
                    {/each}
                  </div>
                  <div class="flex justify-end gap-2 mt-4">
                    <Button
                      onclick={() => handleComplete(tx.id)}
                      disabled={loading === tx.id}
                    >
                      {#if loading === tx.id}
                        <Loader2 class="h-4 w-4 animate-spin mr-2" />
                      {:else}
                        <Check class="h-4 w-4 mr-2" />
                      {/if}
                      Selesaikan
                    </Button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Completed Transactions -->
  {#if completedTransactions.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Check class="h-5 w-5 text-green-600" />
          Selesai ({completedTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#each completedTransactions as tx}
            <div class="flex items-center justify-between p-4 rounded-lg bg-accent/50">
              <div class="flex items-center gap-3">
                <User class="h-5 w-5 text-muted-foreground" />
                <div>
                  <p class="font-medium">{tx.supplierName}</p>
                  <p class="text-sm text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-muted-foreground">{tx.totalItemsSold} terjual</p>
                <p class="font-bold text-primary">Rp {tx.totalPayout.toLocaleString('id-ID')}</p>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {:else if draftTransactions.length === 0 && verifiedTransactions.length === 0}
    <Card>
      <CardContent class="py-12 text-center">
        <Package class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p class="text-muted-foreground">Belum ada transaksi</p>
      </CardContent>
    </Card>
  {/if}
</div>
