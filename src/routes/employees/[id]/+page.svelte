<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { darkenColor, hexToRgb } from '$lib/utils/colors';
	import { ArrowLeft } from 'lucide-svelte';

	let { data, form }: PageProps = $props();
	let { employee, tags: rawTags } = data;
	let entries = $state(
		data.entries && typeof data.entries.toSerializable === 'function'
			? data.entries.toSerializable()
			: data.entries || []
	);
	let tags = $derived((rawTags || []).filter((t) => t && t.name));
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

	function getTagColor(tagName: string) {
		const tag = tags.find((t) => t.name === tagName);
		return tag?.color || '#cccccc';
	}
</script>

<svelte:head>
	<title>{employee.first_name} {employee.last_name}</title>
</svelte:head>

<div class="container mx-auto p-4">
	<div class="mb-4">
		<button onclick={() => history.back()} class="flex items-center text-blue-500 hover:underline">
			<ArrowLeft class="w-5 h-5 mr-2" />
			Back
		</button>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<div class="md:col-span-1">
			<div class="bg-white p-6 rounded-lg shadow">
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
		</div>
		<div class="md:col-span-2">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-bold text-gray-800">Performance Entries</h2>
				<button
					class="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600"
					onclick={() => {
						// scroll to form
						document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth' });
					}}
				>
					Add Entry
				</button>
			</div>
			<div class="space-y-4">
				{#each entries as entry (entry.id)}
					<div class="bg-white p-4 rounded-lg shadow">
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm text-gray-500"
								>{new Date(entry.xata.createdAt).toLocaleDateString()}</span
							>
							<StarRating rating={entry.rating || 0} isEditable={false} />
						</div>
						<p class="text-gray-700">{entry.note}</p>
						{#if Array.isArray(entry.tags) && entry.tags.length > 0}
							<div class="flex flex-wrap gap-2 mt-2">
								{#each entry.tags as tag (tag)}
									{@const color = getTagColor(tag)}
									<span
										class="px-2 py-1 text-xs font-semibold rounded-full"
										style:background-color={color}
										style:color={darkenColor(color, 60)}
									>
										{tag}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<form
				id="entry-form"
				method="POST"
				action="?/createEntry&employeeId={employee.id}"
				class="mt-8 bg-white p-6 rounded-lg shadow"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						newEntry.rating = 0;
						newEntry.note = '';
						newEntry.tags = [];
					};
				}}
			>
				<h2 class="text-2xl font-bold text-gray-800 mb-4">Add New Entry</h2>
				<StarRating bind:rating={newEntry.rating} />
				<textarea
					name="note"
					bind:value={newEntry.note}
					placeholder="Add a performance note..."
					class="w-full mt-4 p-2 border rounded"
					rows="4"
					required
				></textarea>
				<div class="mt-4">
					<h3 class="font-semibold text-gray-700 mb-2">Tags</h3>
					<div class="flex flex-wrap gap-2">
						{#each tags as tag (tag.id)}
							{@const color = getTagColor(tag.name ?? '')}
							<button
								type="button"
								class="px-3 py-1 text-sm font-medium rounded-full"
								class:selected={newEntry.tags.includes(tag.name ?? '')}
								style:background-color={newEntry.tags.includes(tag.name ?? '') ? color : '#f0f0f0'}
								style:color={newEntry.tags.includes(tag.name ?? '')
									? darkenColor(color || '#f0f0f0', 60)
									: '#333'}
								onclick={() => toggleTag(tag.name ?? '')}
							>
								{tag.name}
							</button>
						{/each}
					</div>
					<input type="hidden" name="tags" value={newEntry.tags.join(',')} />
				</div>
				<button
					type="submit"
					class="w-36 h-10 mt-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
					disabled={loading}
				>
					{#if loading}
						<Spinner />
					{:else}
						Submit Entry
					{/if}
				</button>
				{#if form?.error}
					<p class="text-red-500 mt-2">{form.error}</p>
				{/if}
			</form>
		</div>
	</div>
</div>

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
