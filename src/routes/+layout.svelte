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

<div class="flex flex-col min-h-screen bg-gray-50">
	<Header user={data.user} />

	<main class="flex-grow container mx-auto p-4 pb-20 md:pb-4">
		{@render children()}
	</main>
</div>
