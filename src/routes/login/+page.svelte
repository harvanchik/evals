<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';

	let { form }: PageProps = $props();
	let loading = $state(false);
	let organization = $state('');

	$effect(() => {
		const savedOrgCode = localStorage.getItem('organizationCode');
		if (savedOrgCode && savedOrgCode !== 'null') {
			organization = savedOrgCode;
		}
	});
</script>

<svelte:head>
	<title>Login / Sign Up</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full p-8">
		<h1 class="text-2xl font-bold text-center text-gray-800 mb-1">
			Welcome to the Employee Performance Tracker
		</h1>
		<h2 class="text-sm text-center text-gray-500 mb-6">created by Jake Harvanchik</h2>
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				if (organization) {
					localStorage.setItem('organizationCode', organization);
				} else {
					localStorage.setItem('organizationCode', 'null');
				}
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="username" class="block text-sm font-medium text-gray-700">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					required
					maxlength="16"
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-700"
					>Password (optional)</label
				>
				<input
					id="password"
					name="password"
					type="password"
					maxlength="16"
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			<div>
				<label for="organization" class="block text-sm font-medium text-gray-700"
					>Organization (optional)</label
				>
				<input
					id="organization"
					name="organization"
					type="text"
					bind:value={organization}
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			{#if form?.error}
				<p class="text-red-500 text-sm">{form.error}</p>
			{/if}
			<button
				type="submit"
				class="w-full h-10 flex justify-center py-2 px-4 border border-transparent rounded-md cursor-pointer disabled:cursor-not-allowed shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				disabled={loading}
			>
				{#if loading}
					<Spinner />
				{:else}
					Login / Sign Up
				{/if}
			</button>
		</form>
	</div>
</div>
