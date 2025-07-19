<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';

	let { data, form }: PageProps = $props();
	let positions = $derived(data.positions || []);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Bulk Add Employees</title>
</svelte:head>

<div class="p-4 max-w-2xl mx-auto">
	<a href="/employees" class="text-blue-500 hover:underline mb-4 inline-block"
		>&larr; Back to Employees</a
	>
	<h1 class="text-2xl font-bold text-gray-800 mb-4">Bulk Add Employees</h1>

	<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
		<p class="font-bold">Instructions</p>
		<p>Paste CSV data below. Each line should represent one employee.</p>
		<p>
			The format must be: <code class="bg-blue-200 p-1 rounded">firstName,lastName,position</code>
		</p>
		<p>The position must already exist in the system.</p>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update({ reset: false });
				loading = false;
			};
		}}
		class="space-y-4"
	>
		<label class="block">
			<span class="text-gray-700">CSV Data</span>
			<textarea
				name="csvData"
				class="w-full p-2 border rounded mt-1 h-64 font-mono"
				placeholder="John,Doe,Developer..."
				required
			></textarea>
		</label>
		<button
			type="submit"
			class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-40 h-10 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
			disabled={loading}
		>
			{#if loading}
				<Spinner />
			{:else}
				Import Employees
			{/if}
		</button>
	</form>

	{#if form}
		<div class="mt-8">
			<h2 class="text-xl font-bold">Import Results</h2>
			{#if form.success}
				<div class="mt-4 p-4 bg-green-100 text-green-700 rounded">
					<p>{form.successCount} employee(s) successfully imported.</p>
				</div>
			{/if}
			{#if form.errors && form.errors.length > 0}
				<div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
					<p class="font-bold">The following rows had errors and were not imported:</p>
					<ul class="list-disc list-inside mt-2">
						{#each form.errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>
