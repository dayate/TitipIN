<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { Sonner } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<meta name="theme-color" content="#e11d48" />
	<title>Mak Unyil - Konsinyasi Digital</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<Sonner position="top-center" richColors closeButton />
