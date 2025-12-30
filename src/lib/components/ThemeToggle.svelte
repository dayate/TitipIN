<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Sun, Moon } from 'lucide-svelte';

  let isDark = $state(false);

  onMount(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme');
    if (stored) {
      isDark = stored === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
  });

  function applyTheme() {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggle() {
    isDark = !isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
  }
</script>

<Button
  variant="ghost"
  size="icon"
  onclick={toggle}
  class="text-current hover:bg-white/10"
  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if isDark}
    <Sun class="h-5 w-5" />
  {:else}
    <Moon class="h-5 w-5" />
  {/if}
</Button>
