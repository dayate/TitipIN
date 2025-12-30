<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Eye, EyeOff, Loader2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';

  let whatsapp = $state('');
  let pin = $state('');
  let loading = $state(false);
  let showPin = $state(false);

  onMount(() => {
    // Check for error params (e.g., from hooks redirect)
    const errorParam = $page.url.searchParams.get('error');
    if (errorParam === 'pending') {
      toast.error('Akun belum diaktifkan. Tunggu persetujuan admin.');
    }
  });

  async function handleLogin() {
    if (!whatsapp || pin.length !== 6) {
      toast.error('Masukkan nomor WA dan PIN 6 digit');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login gagal');
        return;
      }

      toast.success('Login berhasil!');

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === 'admin') {
          goto('/admin');
        } else {
          goto('/app');
        }
      }, 500);
    } catch (e) {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/30 dark:via-background dark:to-background flex flex-col items-center justify-center p-4">
  <!-- Logo & Title -->
  <div class="text-center mb-8">
    <div class="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
      <span class="text-4xl">🍩</span>
    </div>
    <h1 class="text-3xl font-bold text-white">Mak Unyil</h1>
    <p class="text-white/80 mt-1">Konsinyasi Digital</p>
  </div>

  <!-- Login Card -->
  <Card class="w-full max-w-sm">
    <CardHeader class="text-center pb-2">
      <CardTitle class="text-xl">Masuk ke Akun</CardTitle>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <!-- WhatsApp Input -->
        <div class="mb-4">
          <label for="whatsapp" class="block text-sm font-medium mb-2">Nomor WhatsApp</label>
          <Input
            id="whatsapp"
            type="tel"
            bind:value={whatsapp}
            placeholder="08xxxxxxxxxx"
            disabled={loading}
          />
        </div>

        <!-- PIN Input -->
        <div class="mb-6">
          <label for="pin" class="block text-sm font-medium mb-2">PIN (6 Digit)</label>
          <div class="relative">
            <Input
              id="pin"
              type={showPin ? 'text' : 'password'}
              bind:value={pin}
              placeholder="••••••"
              maxlength={6}
              disabled={loading}
              class="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
              onclick={() => showPin = !showPin}
            >
              {#if showPin}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </Button>
          </div>
          <p class="text-xs text-muted-foreground mt-1">Masukkan 6 digit PIN Anda</p>
        </div>

        <!-- Login Button -->
        <Button
          type="submit"
          class="w-full"
          size="lg"
          disabled={loading || pin.length !== 6}
        >
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
            Memproses...
          {:else}
            Masuk
          {/if}
        </Button>
      </form>

      <!-- Links -->
      <div class="text-center text-sm text-muted-foreground mt-4 space-y-2">
        <p>
          <a href="/auth/forgot-pin" class="text-primary font-medium hover:underline">Lupa PIN?</a>
        </p>
        <p>
          Belum punya akun?
          <a href="/auth/register" class="text-primary font-medium hover:underline">Daftar</a>
        </p>
      </div>
    </CardContent>
  </Card>

  <!-- Footer -->
  <p class="text-white/60 text-xs mt-8">
    © 2024 Mak Unyil. All rights reserved.
  </p>
</div>
