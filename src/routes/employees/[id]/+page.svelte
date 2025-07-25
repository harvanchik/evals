<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { darkenColor, hexToRgb } from '$lib/utils/colors';
	import { Plus, Minus } from 'lucide-svelte';

	let { data, form }: PageProps = $props();
	let { employee, tags: rawTags } = data;
	let entries = $state(
		data.entries && typeof data.entries.toSerializable === 'function'
			? data.entries.toSerializable()
			: data.entries || []
	);
	let tags = $derived((Array.isArray(rawTags) ? rawTags : []).filter((t) => t && t.name));
	let hoveredTag = $state<string | null>(null);

	let loading = $state(false);
	let showForm = $state(false);

	let newEntry = $state({
		note: '',
		rating: 2.5,
		tags: [] as string[]
	});

	function toggleTag(tagName: string) {
		const index = newEntry.tags.indexOf(tagName);
		if (index > -1) {
			newEntry.tags.splice(index, 1);
		} else {
			newEntry.tags.push(tagName);
		}
	}

	function toggleForm() {
		showForm = !showForm;
		if (!showForm) {
			// Reset the form when closing
			newEntry.note = '';
			newEntry.rating = 2.5;
			newEntry.tags = [];
		}
	}

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
			</div>

			<div class="mb-6">
				<div
					class="flex items-center mb-2 cursor-pointer md:cursor-auto"
					onclick={toggleForm}
					onkeypress={toggleForm}
					role="button"
					tabindex="0"
				>
					<h3 class="text-xl font-semibold text-gray-700">Add New Entry</h3>
					<span class="md:hidden ml-2">
						{#if showForm}
							<Minus />
						{:else}
							<Plus />
						{/if}
					</span>
				</div>

				<form
					method="POST"
					action="?/createEntry"
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

								// Reset form state
								showForm = false;
								newEntry = { note: '', rating: 2.5, tags: [] };
							}
							loading = false;
						};
					}}
					class="bg-white p-6 rounded-lg shadow-md md:block"
					class:hidden={!showForm}
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
						<input type="hidden" name="rating" value={newEntry.rating} />
						<StarRating bind:rating={newEntry.rating} />
					</div>
					<fieldset class="mb-4">
						<legend class="block text-sm font-medium text-gray-700 mb-2">Tags</legend>
						<div class="flex flex-wrap gap-2">
							{#each tags as tag (tag.id)}
								{@const isSelected = newEntry.tags.includes(tag.name!)}
								{@const rgbColor = hexToRgb(typeof tag.color === 'string' ? tag.color : '')}
								<button
									type="button"
									onclick={() => toggleTag(tag.name!)}
									class="cursor-pointer px-2 py-1 text-sm font-semibold rounded-md transition-all duration-200"
									class:selected={isSelected}
									style="--tag-color: {rgbColor}; --tag-color-dark: {darkenColor(
										typeof tag.color === 'string' ? tag.color : '#e5e7eb',
										40
									)};"
								>
									{tag.name}
								</button>
							{/each}
						</div>
						<!-- Hidden inputs for form submission -->
						{#each newEntry.tags as selectedTag}
							<input type="hidden" name="tags" value={selectedTag} />
						{/each}
					</fieldset>
					<div class="flex justify-end space-x-2">
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
						<button
							type="button"
							onclick={toggleForm}
							class="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 ml-2"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>

			<div class="flex space-x-4 text-sm text-gray-600 mb-4">
				<span>Total Entries: {entries.length}</span>
				{#if entries.length > 0}
					<span>Average Rating: {avgRating.toFixed(1)}/5</span>
				{/if}
			</div>

			<div class="space-y-4">
				{#if entries.length > 0}
					{#each entries as entry (entry.id)}
						<div class="bg-white p-4 rounded-lg shadow-md">
							<div class="flex justify-between items-start mb-2">
								<p class="text-gray-800 flex-1">{entry.note}</p>
								<div class="flex items-center space-x-2 ml-4">
									<span class="text-lg font-bold text-blue-600"
										>{typeof entry.rating === 'number' ? entry.rating : 0}/5</span
									>
									<span class="text-xs text-gray-500">{formatTimeAgo(entry.xata.createdAt)}</span>
								</div>
							</div>
							{#if Array.isArray(entry.tags) && entry.tags.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each entry.tags as tagString}
										{@const tagObject = tags.find((t) => t.name === tagString)}
										{#if tagObject}
											{@const rgbColor = hexToRgb(
												typeof tagObject.color === 'string' ? tagObject.color : ''
											)}
											<span
												class="px-2 py-1 text-xs font-semibold rounded-md"
												style="--tag-color: {rgbColor}; --tag-color-dark: {darkenColor(
													typeof tagObject.color === 'string' ? tagObject.color : '#e5e7eb',
													40
												)};"
											>
												{tagString}
											</span>
										{/if}
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

<style>
	/* Default state for unselected tag buttons */
	button[style*='--tag-color'] {
		background-color: rgba(var(--tag-color), 0.2);
		color: var(--tag-color-dark);
		border: 1px solid rgba(var(--tag-color), 0.3);
	}

	/* Unselected tag buttons on hover */
	button[style*='--tag-color']:hover:not(.selected) {
		background-color: rgba(var(--tag-color), 0.8);
		color: var(--tag-color-dark);
	}

	/* Selected tag buttons */
	button[style*='--tag-color'].selected {
		background-color: rgba(var(--tag-color), 0.8);
		color: var(--tag-color-dark);
		/* Using box-shadow for a border that doesn't affect layout */
		box-shadow: 0 0 0 2px var(--tag-color-dark);
		border-color: transparent; /* Hides the base border to avoid a double border */
	}

	/* Tag spans (for display only) - make them look bright */
	span[style*='--tag-color'] {
		background-color: rgba(var(--tag-color), 0.8);
		color: var(--tag-color-dark);
		border: 1px solid transparent;
	}
</style>
