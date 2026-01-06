<script lang="ts">
  import { Card, Button, Input } from "$lib/components/ui";
  import {
    ArrowLeft,
    MapPin,
    Phone,
    Plus,
    Edit,
    Trash2,
    Star,
    Building2,
    CheckCircle2,
    XCircle,
    Loader2,
  } from "lucide-svelte";

  let { data } = $props();

  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let editingBranch = $state<(typeof data.branches)[0] | null>(null);
  let loading = $state(false);
  let error = $state("");

  // Form states
  let name = $state("");
  let address = $state("");
  let phone = $state("");
  let isMain = $state(false);

  function resetForm() {
    name = "";
    address = "";
    phone = "";
    isMain = false;
    error = "";
  }

  function openEditModal(branch: (typeof data.branches)[0]) {
    editingBranch = branch;
    name = branch.name;
    address = branch.address;
    phone = branch.phone || "";
    isMain = branch.isMain;
    showEditModal = true;
  }

  async function createBranch() {
    if (!name.trim() || !address.trim()) {
      error = "Nama dan alamat wajib diisi";
      return;
    }

    loading = true;
    error = "";

    try {
      const res = await fetch(`/api/stores/${data.store.id}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone, isMain }),
      });

      const result = await res.json();

      if (!res.ok) {
        error = result.error || "Gagal menambah cabang";
        return;
      }

      // Refresh page
      window.location.reload();
    } catch (e) {
      error = "Terjadi kesalahan";
    } finally {
      loading = false;
    }
  }

  async function updateBranch() {
    if (!editingBranch || !name.trim() || !address.trim()) {
      error = "Nama dan alamat wajib diisi";
      return;
    }

    loading = true;
    error = "";

    try {
      const res = await fetch(
        `/api/stores/${data.store.id}/branches/${editingBranch.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, address, phone, isMain }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        error = result.error || "Gagal memperbarui cabang";
        return;
      }

      window.location.reload();
    } catch (e) {
      error = "Terjadi kesalahan";
    } finally {
      loading = false;
    }
  }

  async function deleteBranch(branchId: number) {
    if (!confirm("Hapus cabang ini?")) return;

    try {
      const res = await fetch(
        `/api/stores/${data.store.id}/branches/${branchId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const result = await res.json();
        alert(result.error || "Gagal menghapus cabang");
        return;
      }

      window.location.reload();
    } catch (e) {
      alert("Terjadi kesalahan");
    }
  }

  async function toggleActive(branch: (typeof data.branches)[0]) {
    try {
      const res = await fetch(
        `/api/stores/${data.store.id}/branches/${branch.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !branch.isActive }),
        },
      );

      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  }
</script>

<svelte:head>
  <title>Cabang - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
  <!-- Header -->
  <div
    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-background p-6"
  >
    <div
      class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"
    ></div>
    <a
      href="/admin/stores/{data.store.id}"
      class="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali
    </a>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 backdrop-blur-sm"
        >
          <Building2 class="h-7 w-7 text-blue-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Cabang</h1>
          <p class="text-muted-foreground">{data.store.name}</p>
        </div>
      </div>
      <Button
        onclick={() => {
          resetForm();
          showAddModal = true;
        }}
        class="gap-2"
      >
        <Plus class="h-4 w-4" />
        Tambah Cabang
      </Button>
    </div>
  </div>

  <!-- Branches List -->
  {#if data.branches.length === 0}
    <Card class="text-center py-12">
      <Building2 class="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">
        Belum Ada Cabang
      </h3>
      <p class="text-muted-foreground mb-4">
        Tambah cabang untuk mengelola lokasi lapak Anda
      </p>
      <Button
        onclick={() => {
          resetForm();
          showAddModal = true;
        }}
      >
        <Plus class="h-4 w-4 mr-2" />
        Tambah Cabang Pertama
      </Button>
    </Card>
  {:else}
    <div class="space-y-3">
      {#each data.branches as branch}
        <Card
          class="flex items-center justify-between {branch.isMain
            ? 'border-primary/50 bg-primary/5'
            : ''} {!branch.isActive ? 'opacity-60' : ''}"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl {branch.isMain
                ? 'bg-primary/20'
                : 'bg-muted'}"
            >
              {#if branch.isMain}
                <Star class="h-6 w-6 text-primary fill-current" />
              {:else}
                <MapPin class="h-6 w-6 text-muted-foreground" />
              {/if}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-foreground">{branch.name}</h3>
                {#if branch.isMain}
                  <span
                    class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                    >Utama</span
                  >
                {/if}
                {#if !branch.isActive}
                  <span
                    class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                    >Nonaktif</span
                  >
                {/if}
              </div>
              <p class="text-sm text-muted-foreground">{branch.address}</p>
              {#if branch.phone}
                <p
                  class="text-xs text-muted-foreground flex items-center gap-1 mt-1"
                >
                  <Phone class="h-3 w-3" />
                  {branch.phone}
                </p>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onclick={() => toggleActive(branch)}
              class="h-8 w-8 p-0"
              title={branch.isActive ? "Nonaktifkan" : "Aktifkan"}
            >
              {#if branch.isActive}
                <CheckCircle2 class="h-4 w-4 text-green-500" />
              {:else}
                <XCircle class="h-4 w-4 text-muted-foreground" />
              {/if}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onclick={() => openEditModal(branch)}
              class="h-8 w-8 p-0"
            >
              <Edit class="h-4 w-4" />
            </Button>
            {#if !branch.isMain}
              <Button
                variant="ghost"
                size="sm"
                onclick={() => deleteBranch(branch.id)}
                class="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Modal -->
{#if showAddModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
  >
    <Card class="w-full max-w-md">
      <h3 class="text-lg font-semibold text-foreground mb-4">Tambah Cabang</h3>

      {#if error}
        <div
          class="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label for="name" class="text-sm font-medium text-foreground"
            >Nama Cabang *</label
          >
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Cabang Pusat"
            class="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <div>
          <label for="address" class="text-sm font-medium text-foreground"
            >Alamat *</label
          >
          <textarea
            id="address"
            bind:value={address}
            rows="2"
            placeholder="Jl. Contoh No. 123"
            class="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
          ></textarea>
        </div>
        <div>
          <label for="phone" class="text-sm font-medium text-foreground"
            >Telepon</label
          >
          <input
            id="phone"
            type="text"
            bind:value={phone}
            placeholder="08xxxxxxxxxx"
            class="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={isMain}
            class="h-4 w-4 rounded border-input accent-primary"
          />
          <span class="text-sm text-foreground">Jadikan cabang utama</span>
        </label>
      </div>

      <div class="flex gap-3 mt-6">
        <Button
          variant="outline"
          class="flex-1"
          onclick={() => (showAddModal = false)}
          disabled={loading}
        >
          Batal
        </Button>
        <Button class="flex-1" onclick={createBranch} disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
          {/if}
          Simpan
        </Button>
      </div>
    </Card>
  </div>
{/if}

<!-- Edit Modal -->
{#if showEditModal && editingBranch}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
  >
    <Card class="w-full max-w-md">
      <h3 class="text-lg font-semibold text-foreground mb-4">Edit Cabang</h3>

      {#if error}
        <div
          class="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label for="edit-name" class="text-sm font-medium text-foreground"
            >Nama Cabang *</label
          >
          <input
            id="edit-name"
            type="text"
            bind:value={name}
            placeholder="Cabang Pusat"
            class="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <div>
          <label for="edit-address" class="text-sm font-medium text-foreground"
            >Alamat *</label
          >
          <textarea
            id="edit-address"
            bind:value={address}
            rows="2"
            placeholder="Jl. Contoh No. 123"
            class="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
          ></textarea>
        </div>
        <div>
          <label for="edit-phone" class="text-sm font-medium text-foreground"
            >Telepon</label
          >
          <input
            id="edit-phone"
            type="text"
            bind:value={phone}
            placeholder="08xxxxxxxxxx"
            class="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={isMain}
            class="h-4 w-4 rounded border-input accent-primary"
          />
          <span class="text-sm text-foreground">Jadikan cabang utama</span>
        </label>
      </div>

      <div class="flex gap-3 mt-6">
        <Button
          variant="outline"
          class="flex-1"
          onclick={() => (showEditModal = false)}
          disabled={loading}
        >
          Batal
        </Button>
        <Button class="flex-1" onclick={updateBranch} disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
          {/if}
          Simpan
        </Button>
      </div>
    </Card>
  </div>
{/if}
