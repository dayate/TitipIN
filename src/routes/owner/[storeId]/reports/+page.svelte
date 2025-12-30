<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import {
    BarChart3, Download, TrendingUp, Package, Users, ShoppingCart,
    DollarSign, CalendarDays
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';

  let { data } = $props<{ data: PageData }>();

  let period = $state<'week' | 'month' | 'year'>('week');
  let isLoading = $state(false);
  let reportData = $state<any>(null);

  async function fetchReportData() {
    isLoading = true;
    try {
      const res = await fetch(`/api/stores/${data.storeId}/reports?period=${period}`);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengambil data');
        return;
      }

      reportData = result;
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  async function exportReport() {
    try {
      const dateFrom = reportData?.dateRange?.from || '';
      const dateTo = reportData?.dateRange?.to || '';
      window.location.href = `/api/reports/export?from=${dateFrom}&to=${dateTo}`;
      toast.success('Mengunduh laporan...');
    } catch (e) {
      toast.error('Gagal mengunduh');
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  }

  // Get max value for chart scaling
  function getMaxValue(data: any[], key: string) {
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map(d => d[key])) || 100;
  }

  onMount(() => {
    fetchReportData();
  });

  $effect(() => {
    if (period) {
      fetchReportData();
    }
  });
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <BarChart3 class="h-6 w-6" />
        Laporan
      </h1>
      <p class="text-muted-foreground">{data.store?.name}</p>
    </div>
    <Button onclick={exportReport} disabled={!reportData}>
      <Download class="h-4 w-4 mr-2" />
      Export Excel
    </Button>
  </div>

  <!-- Period Filter -->
  <div class="flex gap-2 mb-6">
    <Button
      variant={period === 'week' ? 'default' : 'outline'}
      onclick={() => period = 'week'}
    >
      7 Hari
    </Button>
    <Button
      variant={period === 'month' ? 'default' : 'outline'}
      onclick={() => period = 'month'}
    >
      30 Hari
    </Button>
    <Button
      variant={period === 'year' ? 'default' : 'outline'}
      onclick={() => period = 'year'}
    >
      1 Tahun
    </Button>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <ShoppingCart class="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Transaksi</p>
            <p class="text-xl font-bold">{reportData?.summary?.totalTransactions || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Package class="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Item Terjual</p>
            <p class="text-xl font-bold">{reportData?.summary?.totalItemsSold || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <TrendingUp class="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Item Masuk</p>
            <p class="text-xl font-bold">{reportData?.summary?.totalItemsIn || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <DollarSign class="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Bayar</p>
            <p class="text-lg font-bold">{formatCurrency(reportData?.summary?.totalPayout || 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  {#if isLoading}
    <Card>
      <CardContent class="py-12 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-muted-foreground">Memuat data...</p>
      </CardContent>
    </Card>
  {:else if reportData}
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Sales Chart (Simple Bar) -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <CalendarDays class="h-4 w-4" />
            Penjualan Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          {#if reportData.chartData && reportData.chartData.length > 0}
            <div class="space-y-2">
              {#each reportData.chartData.slice(-10) as day}
                {@const maxSold = getMaxValue(reportData.chartData, 'itemsSold')}
                <div class="flex items-center gap-3">
                  <span class="text-xs text-muted-foreground w-16 shrink-0">
                    {formatDate(day.date)}
                  </span>
                  <div class="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary rounded-full transition-all"
                      style="width: {(day.itemsSold / maxSold) * 100}%"
                    ></div>
                  </div>
                  <span class="text-sm font-medium w-12 text-right">{day.itemsSold}</span>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-center text-muted-foreground py-8">Tidak ada data</p>
          {/if}
        </CardContent>
      </Card>

      <!-- Top Products -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <Package class="h-4 w-4" />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          {#if reportData.topProducts && reportData.topProducts.length > 0}
            <div class="space-y-3">
              {#each reportData.topProducts as product, i}
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span class="flex-1 truncate">{product.productName}</span>
                  <Badge variant="secondary">{product.totalSold || 0} terjual</Badge>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-center text-muted-foreground py-8">Tidak ada data</p>
          {/if}
        </CardContent>
      </Card>

      <!-- Supplier Stats -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <Users class="h-4 w-4" />
            Rekap Penyetor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {#if reportData.supplierStats && reportData.supplierStats.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Nama</th>
                    <th class="text-right py-2 px-2 text-sm font-medium text-muted-foreground">Item Terjual</th>
                    <th class="text-right py-2 px-2 text-sm font-medium text-muted-foreground">Total Bayar</th>
                  </tr>
                </thead>
                <tbody>
                  {#each reportData.supplierStats as supplier}
                    <tr class="border-b">
                      <td class="py-3 px-2">{supplier.name}</td>
                      <td class="py-3 px-2 text-right">{supplier.itemsSold}</td>
                      <td class="py-3 px-2 text-right font-medium">{formatCurrency(supplier.payout)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p class="text-center text-muted-foreground py-8">Tidak ada data</p>
          {/if}
        </CardContent>
      </Card>
    </div>
  {/if}
</div>
