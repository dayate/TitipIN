<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui/card';
  import { Loader2, ArrowLeft } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let whatsapp = $state('');
  let loading = $state(false);
  let submitted = $state(false);

  async function handleSubmit() {
    if (!whatsapp) {
      toast.error('Masukkan nomor WhatsApp');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/auth/forgot-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan');
        return;
      }

      toast.success(data.message);
      submitted = true;
    } catch (e) {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex flex-col items-center justify-center p-4">
  <!-- Logo & Title -->
  <div class="text-center mb-8">
    <div class="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
      <span class="text-4xl">🔑</span>
    </div>
    <h1 class="text-3xl font-bold text-white">Lupa PIN</h1>
    <p class="text-white/80 mt-1">Reset PIN akun Anda</p>
  </div>

  <!-- Reset Card -->
  <Card class="w-full max-w-sm">
    <CardHeader class="text-center pb-2">
      <CardTitle class="text-xl">Reset PIN</CardTitle>
      <CardDescription>
        {#if submitted}
          Permintaan Anda telah dikirim
        {:else}
          Masukkan nomor WhatsApp terdaftar
        {/if}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {#if submitted}
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
            <span class="text-3xl">✅</span>
          </div>
          <p class="text-muted-foreground text-sm">
            Permintaan reset PIN telah diajukan. Admin akan menghubungi Anda via WhatsApp untuk konfirmasi.
          </p>
          <Button variant="outline" class="w-full" onclick={() => goto('/auth/login')}>
            <ArrowLeft class="h-4 w-4" />
            Kembali ke Login
          </Button>
        </div>
      {:else}
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div class="mb-6">
            <label for="whatsapp" class="block text-sm font-medium mb-2">Nomor WhatsApp</label>
            <Input
              id="whatsapp"
              type="tel"
              bind:value={whatsapp}
              placeholder="08xxxxxxxxxx"
              disabled={loading}
            />
            <p class="text-xs text-muted-foreground mt-2">
              Masukkan nomor WA yang terdaftar di akun Anda
            </p>
          </div>

          <Button
            type="submit"
            class="w-full"
            size="lg"
            disabled={loading || !whatsapp}
          >
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" />
              Memproses...
            {:else}
              Kirim Permintaan
            {/if}
          </Button>
        </form>

        <p class="text-center text-sm text-muted-foreground mt-4">
          <a href="/auth/login" class="text-primary font-medium hover:underline">
            ← Kembali ke Login
          </a>
        </p>
      {/if}
    </CardContent>
  </Card>

  <!-- Footer -->
  <p class="text-white/60 text-xs mt-8">
    © 2024 Mak Unyil. All rights reserved.
  </p>
</div>
