<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Loader2, Store, Package } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let name = $state('');
  let whatsapp = $state('');
  let pin = $state('');
  let confirmPin = $state('');
  let role = $state<'owner' | 'supplier'>('supplier');
  let loading = $state(false);

  async function handleRegister() {
    // Validation
    if (!name || !whatsapp || !pin || !confirmPin) {
      toast.error('Semua field wajib diisi');
      return;
    }

    if (pin.length !== 6) {
      toast.error('PIN harus 6 digit');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('Konfirmasi PIN tidak sama');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp, pin, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Pendaftaran gagal');
        return;
      }

      toast.success('Pendaftaran berhasil!');

      if (role === 'owner') {
        // Owner goes to create first store
        setTimeout(() => goto('/auth/login'), 2000);
      } else {
        // Supplier needs approval
        toast.info('Tunggu persetujuan dari pemilik lapak.');
        setTimeout(() => goto('/auth/login'), 2000);
      }
    } catch (e) {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/30 dark:via-background dark:to-background flex flex-col items-center justify-center p-4">
  <!-- Logo & Title -->
  <div class="text-center mb-6">
    <div class="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
      <span class="text-3xl">🍩</span>
    </div>
    <h1 class="text-2xl font-bold text-white">Daftar Akun</h1>
    <p class="text-white/80 mt-1 text-sm">Pilih jenis akun Anda</p>
  </div>

  <!-- Register Card -->
  <Card class="w-full max-w-sm">
    <CardContent class="pt-6">
      <form onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>

        <!-- Role Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-3">Daftar Sebagai</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              onclick={() => role = 'owner'}
              class="p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 {role === 'owner' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
            >
              <Store class="h-8 w-8 {role === 'owner' ? 'text-primary' : 'text-muted-foreground'}" />
              <span class="font-medium text-sm {role === 'owner' ? 'text-primary' : ''}">Pemilik Lapak</span>
              <span class="text-xs text-muted-foreground text-center">Buat & kelola lapak</span>
            </button>
            <button
              type="button"
              onclick={() => role = 'supplier'}
              class="p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 {role === 'supplier' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
            >
              <Package class="h-8 w-8 {role === 'supplier' ? 'text-primary' : 'text-muted-foreground'}" />
              <span class="font-medium text-sm {role === 'supplier' ? 'text-primary' : ''}">Penyetor</span>
              <span class="text-xs text-muted-foreground text-center">Titip produk ke lapak</span>
            </button>
          </div>
        </div>

        <!-- Name Input -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium mb-1">Nama Lengkap</label>
          <Input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Masukkan nama"
            disabled={loading}
          />
        </div>

        <!-- WhatsApp Input -->
        <div class="mb-4">
          <label for="whatsapp" class="block text-sm font-medium mb-1">Nomor WhatsApp</label>
          <Input
            id="whatsapp"
            type="tel"
            bind:value={whatsapp}
            placeholder="08xxxxxxxxxx"
            disabled={loading}
          />
        </div>

        <!-- PIN Input -->
        <div class="mb-4">
          <label for="pin" class="block text-sm font-medium mb-1">PIN (6 Digit)</label>
          <Input
            id="pin"
            type="password"
            bind:value={pin}
            placeholder="Masukkan PIN"
            maxlength={6}
            disabled={loading}
          />
        </div>

        <!-- Confirm PIN Input -->
        <div class="mb-6">
          <label for="confirmPin" class="block text-sm font-medium mb-1">Konfirmasi PIN</label>
          <Input
            id="confirmPin"
            type="password"
            bind:value={confirmPin}
            placeholder="Ulangi PIN"
            maxlength={6}
            disabled={loading}
          />
        </div>

        <!-- Register Button -->
        <Button type="submit" class="w-full" size="lg" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
            Memproses...
          {:else}
            Daftar sebagai {role === 'owner' ? 'Pemilik Lapak' : 'Penyetor'}
          {/if}
        </Button>
      </form>

      <!-- Login Link -->
      <p class="text-center text-sm text-muted-foreground mt-4">
        Sudah punya akun?
        <a href="/auth/login" class="text-primary font-medium hover:underline">Masuk</a>
      </p>
    </CardContent>
  </Card>
</div>
