<script lang="ts">
  import { formatDate } from "$lib/utils";
  import { Card, Button } from "$lib/components/ui";
  import {
    ArrowLeft,
    FileText,
    RefreshCw,
    CheckCircle,
    XCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    Edit,
  } from "lucide-svelte";

  export let data;

  $: store = data.store;
  $: auditLogs = data.auditLogs;

  function getActionIcon(action: string) {
    switch (action) {
      case "transaction_verified":
      case "transaction_completed":
      case "product_approved":
        return CheckCircle;
      case "transaction_cancelled":
      case "product_rejected":
        return XCircle;
      case "member_promoted":
        return ArrowUpCircle;
      case "member_demoted":
        return ArrowDownCircle;
      default:
        return Edit;
    }
  }

  function getActionColor(action: string): string {
    if (
      action.includes("approved") ||
      action.includes("completed") ||
      action.includes("verified") ||
      action.includes("promoted")
    ) {
      return "text-green-500";
    }
    if (
      action.includes("rejected") ||
      action.includes("cancelled") ||
      action.includes("demoted")
    ) {
      return "text-red-500";
    }
    return "text-blue-500";
  }

  function formatAction(action: string): string {
    const actions: Record<string, string> = {
      transaction_created: "Transaksi Dibuat",
      transaction_verified: "Transaksi Divalidasi",
      transaction_completed: "Transaksi Selesai",
      transaction_cancelled: "Transaksi Dibatalkan",
      qty_adjusted: "Qty Disesuaikan",
      item_added: "Item Ditambahkan",
      item_removed: "Item Dihapus",
      product_approved: "Produk Disetujui",
      product_rejected: "Produk Ditolak",
      member_promoted: "Member Dipromosikan",
      member_demoted: "Member Diturunkan",
      store_status_changed: "Status Lapak Berubah",
    };
    return actions[action] || action;
  }

  function parseJson(str: string | null): any {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }
</script>

<svelte:head>
  <title>Audit Log - {store.name}</title>
</svelte:head>

<div class="container max-w-4xl mx-auto p-4 space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/admin/stores/{store.id}" class="p-2 rounded-lg hover:bg-muted">
        <ArrowLeft class="h-5 w-5" />
      </a>
      <div>
        <h1 class="text-2xl font-bold">Audit Log</h1>
        <p class="text-muted-foreground">{store.name} - Riwayat perubahan</p>
      </div>
    </div>
    <a
      href="/admin/stores/{store.id}/audit-log"
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm"
    >
      <RefreshCw class="h-4 w-4" />
      Refresh
    </a>
  </div>

  <!-- Info -->
  <div
    class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-3"
  >
    <FileText class="h-5 w-5 text-blue-500" />
    <p class="text-sm">
      Audit log mencatat semua perubahan penting di lapak Anda untuk
      transparansi dan accountability.
    </p>
  </div>

  <!-- Audit Logs List -->
  {#if auditLogs.length > 0}
    <div class="space-y-3">
      {#each auditLogs as log}
        {@const ActionIcon = getActionIcon(log.action)}
        <Card>
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div class="p-2 rounded-lg bg-muted {getActionColor(log.action)}">
              <svelte:component this={ActionIcon} class="h-5 w-5" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-medium">{formatAction(log.action)}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-muted"
                  >{log.entityType}</span
                >
                <span
                  class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >#{log.entityId}</span
                >
              </div>

              <!-- Changes -->
              {#if log.oldValue || log.newValue}
                <div class="text-sm text-muted-foreground space-y-1">
                  {#if log.oldValue}
                    {@const oldVal = parseJson(log.oldValue)}
                    {#if typeof oldVal === "object" && oldVal}
                      <p class="text-xs">Dari: {JSON.stringify(oldVal)}</p>
                    {/if}
                  {/if}
                  {#if log.newValue}
                    {@const newVal = parseJson(log.newValue)}
                    {#if typeof newVal === "object" && newVal}
                      <p class="text-xs">Ke: {JSON.stringify(newVal)}</p>
                    {/if}
                  {/if}
                </div>
              {/if}

              {#if log.reason}
                <p class="text-sm text-muted-foreground mt-1">
                  Alasan: {log.reason}
                </p>
              {/if}
            </div>

            <!-- Timestamp -->
            <div class="text-right text-sm text-muted-foreground shrink-0">
              {#if log.createdAt}
                <p>{formatDate(log.createdAt)}</p>
                <p class="text-xs">
                  {log.createdAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {:else}
    <Card>
      <div class="py-8 text-center">
        <FileText class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 class="text-lg font-medium">Belum ada log</h3>
        <p class="text-muted-foreground">
          Audit log akan muncul setelah ada aktivitas di lapak
        </p>
      </div>
    </Card>
  {/if}
</div>
