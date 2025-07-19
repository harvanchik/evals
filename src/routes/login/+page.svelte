<script lang="ts">
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Login / Sign Up</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to EPT</h1>
		<form method="POST" class="space-y-4">
			<div>
				<label for="username" class="block text-sm font-medium text-gray-700">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					required
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
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			{#if form?.error}
				<p class="text-red-500 text-sm">{form.error}</p>
			{/if}
			<button
				type="submit"
				class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md cursor-pointer disabled:cursor-not-allowed shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				Login / Sign Up
			</button>
		</form>
	</div>
</div>
