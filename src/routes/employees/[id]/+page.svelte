<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';

	let { data, form }: PageProps = $props();
	let { employee, tags } = data;
	let entries = $state(
		data.entries && typeof data.entries.toSerializable === 'function'
			? data.entries.toSerializable()
			: data.entries || []
	);

	let loading = $state(false);
	let showForm = $state(false);

	let newEntry = $state({
		note: '',
		rating: 3,
		tags: [] as string[]
	});

	const avgRating = $derived(
		entries.length > 0
			? entries.reduce(
					(sum, entry) => sum + (typeof entry.rating === 'number' ? entry.rating : 0),
					0
				) / entries.length
			: 0
	);

	function formatTimeAgo(date: Date | string | undefined) {
		if (!date) return '';
		const d = new Date(date);
		const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
		const diff = (d.getTime() - Date.now()) / 1000;
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

		if (Math.abs(diff) < 3600) {
			return rtf.format(Math.round(diff / 60), 'minute');
		}
		if (Math.abs(diff) < 86400) {
			return rtf.format(Math.round(diff / 3600), 'hour');
		}
		return rtf.format(Math.round(diff / 86400), 'day');
	}
</script>

{#if employee}
	<div class="p-4 max-w-4xl mx-auto">
		<a href="/employees" class="text-blue-500 hover:underline mb-4 inline-block"> &larr; Back </a>
		<div class="flex items-center space-x-4">
			<h1 class="text-3xl font-bold text-gray-800">
				{employee.nickname || employee.first_name}
				{employee.last_name}
				{#if employee.nickname}
					<span class="text-lg text-gray-500">({employee.first_name} {employee.last_name})</span>
				{/if}
			</h1>
			<span class="px-2 py-1 text-xs font-semibold text-white rounded-full bg-gray-500">
				{employee.position}
			</span>
		</div>

		<div class="mt-8">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-bold text-gray-800">Performance Entries</h2>
				<button
					onclick={() => (showForm = !showForm)}
					class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
				>
					{showForm ? 'Cancel' : 'Add Entry'}
				</button>
			</div>

			{#if showForm}
				<form
					method="POST"
					action="?/addEntry"
					use:enhance={() => {
						loading = true;
						return async ({ result }) => {
							if (result.type === 'success' && result.status === 200) {
								entries.unshift({
									...newEntry,
									id: `temp_${Date.now()}`,
									xata: {
										createdAt: new Date(),
										updatedAt: new Date(),
										version: 0
									}
								} as any);

								showForm = false;
								newEntry = { note: '', rating: 3, tags: [] };
							}
							loading = false;
						};
					}}
					class="bg-white p-6 rounded-lg shadow-md mb-6"
				>
					<div class="mb-4">
						<label for="note" class="block text-sm font-medium text-gray-700">Note</label>
						<textarea
							id="note"
							name="note"
							bind:value={newEntry.note}
							rows="4"
							required
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						></textarea>
						{#if form?.missing}
							<p class="text-red-500 text-sm mt-1">Note cannot be empty.</p>
						{/if}
					</div>
					<div class="mb-4">
						<label for="rating" class="block text-sm font-medium text-gray-700"
							>Rating: {newEntry.rating}/5</label
						>
						<input
							id="rating"
							name="rating"
							type="range"
							min="1"
							max="5"
							step="1"
							bind:value={newEntry.rating}
							class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
						/>
					</div>
					<fieldset class="mb-4">
						<legend class="block text-sm font-medium text-gray-700">Tags</legend>
						<div
							class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2"
							role="group"
							aria-labelledby="tags-label"
						>
							{#each tags as tag}
								<label class="flex items-center space-x-2">
									<input
										type="checkbox"
										name="tags"
										value={tag}
										bind:group={newEntry.tags}
										class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
									/>
									<span>{tag}</span>
								</label>
							{/each}
						</div>
					</fieldset>
					<button
						type="submit"
						class="w-36 h-10 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer disabled:cursor-not-allowed"
						disabled={loading}
					>
						{#if loading}
							<Spinner />
						{:else}
							Save Entry
						{/if}
					</button>
				</form>
			{/if}

			<div class="flex space-x-4 text-sm text-gray-600 mb-4">
				<span>Total Entries: {entries.length}</span>
				{#if entries.length > 0}
					<span>Average Rating: {avgRating.toFixed(1)}/5</span>
				{/if}
			</div>

			<div class="space-y-4">
				{#if entries.length > 0}
					{#each entries as entry (entry.id)}
						<div class="bg-white p-4 rounded-lg shadow-md border-l-4" style:border-color="">
							<div class="flex justify-between items-start">
								<p class="text-gray-800 flex-1">{entry.note}</p>
								<div class="flex items-center space-x-2 ml-4">
									<span class="text-lg font-bold text-blue-600"
										>{typeof entry.rating === 'number' ? entry.rating : 0}/5</span
									>
									<span class="text-xs text-gray-500">{formatTimeAgo(entry.xata.createdAt)}</span>
								</div>
							</div>
							{#if Array.isArray(entry.tags) && entry.tags.length > 0}
								<div class="mt-2 flex flex-wrap gap-2">
									{#each entry.tags as tag}
										<span
											class="px-2 py-1 text-xs font-semibold text-white rounded-full bg-gray-400"
										>
											{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				{:else}
					<p class="text-gray-500">No performance entries yet.</p>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<p class="p-4">Employee not found.</p>
{/if}
