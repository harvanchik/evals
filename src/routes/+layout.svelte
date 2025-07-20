<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import type { LayoutProps } from './$types';
	import { navigating } from '$app/stores';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';
	let { children, data }: LayoutProps = $props();

	NProgress.configure({ minimum: 0.16, showSpinner: false });

	$effect(() => {
		if ($navigating) {
			NProgress.start();
		} else {
			NProgress.done();
		}
	});
</script>

<svelte:head>
	<link rel="apple-touch-icon" href="/app.png" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="EPT" />
	<meta name="application-name" content="EPT" />
</svelte:head>

{#if data.user}
	<Header user={data.user} />
{/if}

<main class="container mx-auto p-4 pb-20 md:pb-4">
	{@render children()}
</main>
