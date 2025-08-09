<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import type { LayoutProps } from './$types';
	import { navigating, page } from '$app/stores';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';
	import { positions } from '$lib/stores/positions';
	let { children, data }: LayoutProps = $props();

	// Update positions store when data changes
	$effect(() => {
		if (data.positions) {
			positions.set(data.positions);
		}
	});

	NProgress.configure({
		// Full list: https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16
	});

	$effect(() => {
		if ($navigating) {
			NProgress.start();
		} else {
			NProgress.done();
		}
	});

	let isLoginPage = $derived($page.url.pathname === '/login');

	// Global hotkey handler for Ctrl+K search
	function handleGlobalKeydown(event: KeyboardEvent) {
		// Only handle Ctrl+K (or Cmd+K on Mac) and not on login page
		if ((event.ctrlKey || event.metaKey) && event.key === 'k' && !isLoginPage) {
			event.preventDefault();

			// Dispatch custom event to focus search
			const searchEvent = new CustomEvent('focus-search');
			window.dispatchEvent(searchEvent);
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="flex flex-col min-h-screen bg-gray-50">
	{#if !isLoginPage}
		<Header user={data.user} employees={data.employees || []} />
	{/if}

	<main
		class="flex-grow container mx-auto"
		class:p-4={!isLoginPage}
		class:pb-20={!isLoginPage}
		class:md:pb-4={!isLoginPage}
	>
		{@render children()}
	</main>
</div>
