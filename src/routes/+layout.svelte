<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<Header />

<main class="container mx-auto p-4 pb-20 md:pb-4">
	{@render children()}
</main>
