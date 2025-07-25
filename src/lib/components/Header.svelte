<script lang="ts">
	import type { UsersRecord } from '../../xata';
	import { onMount } from 'svelte';

	let { user } = $props<{ user: UsersRecord }>();

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://unpkg.com/lucide@latest';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			if (typeof lucide !== 'undefined') {
				lucide.createIcons();
			}
		};
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	});
</script>

<header class="bg-gray-100 text-gray-800 shadow-md">
	<nav class="container mx-auto px-4 py-2 flex justify-between items-center">
		<a href="/" class="text-xl font-bold">EPT</a>
		<div class="hidden md:flex space-x-4 items-center">
			<a href="/" class="hover:underline">Dashboard</a>
			<a href="/employees" class="hover:underline">Employees</a>
			<a href="/positions" class="hover:underline">Positions</a>
			<a href="/tags" class="hover:underline">Tags</a>
			<form action="/logout" method="POST">
				<button type="submit" class="hover:underline cursor-pointer">Logout</button>
			</form>
		</div>
	</nav>
</header>

<nav
	class="md:hidden fixed bottom-0 inset-x-0 bg-gray-100 text-gray-800 border-t border-gray-200 z-50"
>
	<div class="flex justify-around items-center h-18 pb-3">
		<a
			href="/"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Dashboard"
		>
			<i data-lucide="layout-dashboard" class="w-5 h-5"></i>
			<span class="text-xs mt-1">Dashboard</span>
		</a>
		<a
			href="/employees"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Employees"
		>
			<i data-lucide="users" class="w-5 h-5"></i>
			<span class="text-xs mt-1">Employees</span>
		</a>
		<a
			href="/positions"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Positions"
		>
			<i data-lucide="briefcase" class="w-5 h-5"></i>
			<span class="text-xs mt-1">Positions</span>
		</a>
		<a
			href="/tags"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Tags"
		>
			<i data-lucide="tags" class="w-5 h-5"></i>
			<span class="text-xs mt-1">Tags</span>
		</a>
		<form action="/logout" method="POST" class="flex flex-col items-center">
			<button
				type="submit"
				class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
				aria-label="Logout"
			>
				<i data-lucide="log-out" class="w-5 h-5"></i>
				<span class="text-xs mt-1">Logout</span>
			</button>
		</form>
	</div>
</nav>
