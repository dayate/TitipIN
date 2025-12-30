<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import {
    Smartphone, Zap, Coins, ArrowRight, Store, Users,
    ShieldCheck, BarChart3, MessageSquare, Bell
  } from 'lucide-svelte';
</script>

<div class="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/30 dark:via-background dark:to-background flex flex-col relative overflow-hidden">
  <!-- Background decoration -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
  </div>

  <!-- Header -->
  <header class="relative z-20 flex items-center justify-between p-4 md:px-8">
    <div class="flex items-center gap-2">
      <span class="text-2xl">🍩</span>
      <span class="font-bold text-white dark:text-foreground">Mak Unyil</span>
    </div>
    <div class="flex items-center gap-2">
      <ThemeToggle />
      <Button
        variant="ghost"
        href="/stores"
        class="text-white/80 hover:text-white hover:bg-white/10 dark:text-foreground"
      >
        <Store class="h-4 w-4 mr-2" />
        Jelajahi Lapak
      </Button>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
    <div class="w-full max-w-5xl">
      <!-- Main Hero -->
      <div class="text-center mb-12">
        <div class="w-28 h-28 bg-white dark:bg-card rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl ring-4 ring-white/20 dark:ring-primary/20 animate-bounce-slow">
          <span class="text-6xl">🍩</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-white dark:text-foreground mb-4 tracking-tight">
          Mak Unyil
        </h1>
        <p class="text-xl md:text-2xl text-white/80 dark:text-muted-foreground mb-2">
          Platform Konsinyasi Digital Multi-Lapak
        </p>
        <p class="text-white/60 dark:text-muted-foreground max-w-lg mx-auto">
          Solusi modern untuk mengelola bisnis titip jual. Transparansi data, efisiensi operasional, dan perhitungan otomatis.
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
        <Card class="bg-white/10 dark:bg-card/80 backdrop-blur border-white/20 dark:border-border hover:bg-white/20 dark:hover:bg-card transition-colors">
          <CardContent class="p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center">
              <Smartphone class="h-7 w-7 text-white dark:text-primary" />
            </div>
            <h3 class="font-semibold text-white dark:text-foreground mb-1">Mobile First</h3>
            <p class="text-xs text-white/70 dark:text-muted-foreground">Input setor dari mana saja</p>
          </CardContent>
        </Card>
        <Card class="bg-white/10 dark:bg-card/80 backdrop-blur border-white/20 dark:border-border hover:bg-white/20 dark:hover:bg-card transition-colors">
          <CardContent class="p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center">
              <Zap class="h-7 w-7 text-white dark:text-primary" />
            </div>
            <h3 class="font-semibold text-white dark:text-foreground mb-1">Validasi Cepat</h3>
            <p class="text-xs text-white/70 dark:text-muted-foreground">Proses verifikasi instan</p>
          </CardContent>
        </Card>
        <Card class="bg-white/10 dark:bg-card/80 backdrop-blur border-white/20 dark:border-border hover:bg-white/20 dark:hover:bg-card transition-colors">
          <CardContent class="p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center">
              <Coins class="h-7 w-7 text-white dark:text-primary" />
            </div>
            <h3 class="font-semibold text-white dark:text-foreground mb-1">Auto Calculate</h3>
            <p class="text-xs text-white/70 dark:text-muted-foreground">Hitung pendapatan otomatis</p>
          </CardContent>
        </Card>
        <Card class="bg-white/10 dark:bg-card/80 backdrop-blur border-white/20 dark:border-border hover:bg-white/20 dark:hover:bg-card transition-colors">
          <CardContent class="p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center">
              <Store class="h-7 w-7 text-white dark:text-primary" />
            </div>
            <h3 class="font-semibold text-white dark:text-foreground mb-1">Multi-Lapak</h3>
            <p class="text-xs text-white/70 dark:text-muted-foreground">Kelola banyak lapak</p>
          </CardContent>
        </Card>
        <Card class="bg-white/10 dark:bg-card/80 backdrop-blur border-white/20 dark:border-border hover:bg-white/20 dark:hover:bg-card transition-colors">
          <CardContent class="p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center">
              <Users class="h-7 w-7 text-white dark:text-primary" />
            </div>
            <h3 class="font-semibold text-white dark:text-foreground mb-1">Multi-Penyetor</h3>
            <p class="text-xs text-white/70 dark:text-muted-foreground">Sistem keanggotaan</p>
          </CardContent>
        </Card>
        <Card class="bg-white/10 dark:bg-card/80 backdrop-blur border-white/20 dark:border-border hover:bg-white/20 dark:hover:bg-card transition-colors">
          <CardContent class="p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center">
              <MessageSquare class="h-7 w-7 text-white dark:text-primary" />
            </div>
            <h3 class="font-semibold text-white dark:text-foreground mb-1">Komunitas</h3>
            <p class="text-xs text-white/70 dark:text-muted-foreground">Forum diskusi terintegrasi</p>
          </CardContent>
        </Card>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <Button
          size="lg"
          class="flex-1 py-6 text-lg font-semibold bg-white text-primary hover:bg-white/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 shadow-lg"
          href="/auth/login"
        >
          Masuk
          <ArrowRight class="h-5 w-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          class="flex-1 py-6 text-lg font-semibold border-2 border-white/50 text-white hover:bg-white/10 dark:border-primary dark:text-primary dark:hover:bg-primary/10"
          href="/auth/register"
        >
          Daftar Baru
        </Button>
      </div>

      <!-- Trust Indicators -->
      <div class="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 dark:text-muted-foreground text-sm">
        <div class="flex items-center gap-2">
          <ShieldCheck class="h-5 w-5" />
          <span>Data Aman</span>
        </div>
        <div class="flex items-center gap-2">
          <Zap class="h-5 w-5" />
          <span>Performa Cepat</span>
        </div>
        <div class="flex items-center gap-2">
          <Smartphone class="h-5 w-5" />
          <span>Mobile Friendly</span>
        </div>
        <div class="flex items-center gap-2">
          <Bell class="h-5 w-5" />
          <span>Notifikasi WA</span>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 py-6 text-center">
    <p class="text-white/40 dark:text-muted-foreground text-sm">
      © 2024 Mak Unyil. Solusi konsinyasi modern untuk UMKM Indonesia.
    </p>
  </footer>
</div>

<style>
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }
</style>
