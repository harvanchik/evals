<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { darkenColor, hexToRgb } from '$lib/utils/colors';
	import { Plus, Minus } from 'lucide-svelte';
	import { positions as positionsStore, getPositionColor } from '$lib/stores/positions';

	let { data, form }: PageProps = $props();

	// Use derived to ensure reactivity when data changes
	let employee = $derived(data.employee);
	let rawTags = $derived(data.tags);

	let entries = $state<any[]>([]);

	// Update entries when data changes
	$effect(() => {
		entries = (
			data.entries && typeof data.entries.toSerializable === 'function'
				? data.entries.toSerializable()
				: data.entries || []
		).map((entry) => ({ ...entry, showMore: false }));
	});

	let tags = $derived((Array.isArray(rawTags) ? rawTags : []).filter((t) => t && t.name));

	let loading = $state(false);
	let mobileFormVisible = $state(false);
	let newEntry = $state({
		note: '',
		rating: 3,
		tags: [] as string[]
	});

	// Reset form state when employee changes
	$effect(() => {
		if (employee?.id) {
			loading = false;
			// Auto-expand form if no entries exist
			mobileFormVisible = entries.length === 0;
			newEntry = {
				note: '',
				rating: 3,
				tags: []
			};
		}
	});

	// Get position color from the store
	const positionColor = $derived.by(() => {
		const color = getPositionColor(employee?.position, $positionsStore);
		return color;
	});

	function toggleTag(tagName: string) {
		const index = newEntry.tags.indexOf(tagName);
		if (index > -1) {
			newEntry.tags.splice(index, 1);
		} else {
			newEntry.tags.push(tagName);
		}
	}

	function timeAgo(date: string | Date): string {
		const d = new Date(date);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
		const diffInDays = Math.floor(diffInSeconds / 86400);

		if (diffInDays > 7) {
			return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		}

		if (diffInSeconds < 60) return 'Just now';
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
		return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
	}
</script>

{#if employee}
	{#key employee.id}
		<div class="font-sans">
			<a href="/employees" class="text-blue-500 hover:underline px-4 py-6 md:px-6 md:py-8"
				>&larr; Back to Employees</a
			>
			<h1
				class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center mt-6 md:mt-8 pb-2 border-b-4"
				style="border-bottom-color: {positionColor};"
			>
				{employee.nickname || employee.first_name}
				{employee.last_name}
			</h1>

			<div
				class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto"
			>
				<!-- Create New Entry Form -->
				<div class="md:sticky md:top-8 h-fit md:col-span-2">
					<div
						class="flex items-center mb-2 cursor-pointer md:cursor-auto"
						onclick={() => (mobileFormVisible = !mobileFormVisible)}
						onkeypress={() => (mobileFormVisible = !mobileFormVisible)}
						role="button"
						tabindex="0"
					>
						<h2 class="text-xl font-semibold text-gray-700">New Performance Entry</h2>
						<span class="md:hidden ml-2">
							{#if mobileFormVisible}
								<Minus />
							{:else}
								<Plus />
							{/if}
						</span>
					</div>
					<form
						class:hidden={!mobileFormVisible}
						class="md:block space-y-4 p-4 border rounded"
						method="POST"
						action="?/createEntry"
						use:enhance={() => {
							loading = true;
							return async ({ result, update }) => {
								if (result.type === 'success' && result.status === 200) {
									// Reset form and hide mobile form
									newEntry = { note: '', rating: 3, tags: [] };
									mobileFormVisible = false;
									// Update the page data to include the new entry
									await update({ reset: false });
								}
								loading = false;
							};
						}}
					>
						<label class="block">
							<span class="text-gray-700">Note</span>
							<textarea
								name="note"
								bind:value={newEntry.note}
								class="w-full p-2 border rounded"
								rows="3"
								maxlength="500"
								required
							></textarea>
							{#if form?.missing}
								<p class="text-red-500 text-sm mt-1">Note cannot be empty.</p>
							{/if}
						</label>

						<fieldset class="block">
							<legend class="text-gray-700">Rating</legend>
							<StarRating bind:rating={newEntry.rating} isEntryCard={false} />
							<input type="hidden" name="rating" value={newEntry.rating} />
						</fieldset>

						<fieldset class="block">
							<legend class="text-gray-700">Tags (Optional)</legend>
							<div class="flex flex-wrap gap-2 mt-2">
								{#each tags as tag (tag.id)}
									{@const isSelected = newEntry.tags.includes(tag.name!)}
									{@const rgbColor = hexToRgb((tag?.color as string) ?? '')}
									<button
										type="button"
										onclick={() => toggleTag(tag.name!)}
										class="cursor-pointer px-2 py-1 text-sm font-semibold rounded-md transition-all duration-200"
										class:selected={isSelected}
										style="--tag-color: {rgbColor}; --tag-color-dark: {darkenColor(
											(tag?.color as string) ?? '#e5e7eb',
											40
										)};"
										aria-label="Select tag: {tag.name}"
									>
										{tag.name}
									</button>
								{/each}
							</div>
							<input type="hidden" name="tags" value={newEntry.tags.join(',')} />
						</fieldset>

						<div class="flex items-center space-x-2">
							<button
								type="submit"
								class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-36 h-10 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
								disabled={loading}
							>
								{#if loading}
									<Spinner />
								{:else}
									Add Entry
								{/if}
							</button>
						</div>
						{#if form?.error}
							<p class="text-red-500">{form.error}</p>
						{/if}
					</form>
				</div>

				<!-- Performance Entries List -->
				<div class="md:mt-[2.25rem] lg:col-span-3 md:col-span-2">
					<!-- max-h-[60vh] md:max-h-[72vh] overflow-y-auto -->
					<div class="">
						{#if entries.length === 0}
							<div
								class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center md:mt-[2.25rem]"
							>
								<div class="text-gray-400 mb-4">
									<svg
										class="mx-auto h-12 w-12"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								</div>
								<h3 class="text-lg font-medium text-gray-900 mb-2">No Performance Entries Yet</h3>
								<p class="text-gray-500 mb-4 min-md:flex hidden">
									This employee doesn't have any performance entries yet. Use the form on the left
									to create the first entry.
								</p>
								<p class="text-gray-500 mb-4 max-md:flex hidden">
									This employee doesn't have any performance entries yet. Use the form above to
									create the first entry.
								</p>
								{#if !mobileFormVisible}
									<div class="md:hidden">
										<button
											type="button"
											onclick={() => (mobileFormVisible = true)}
											class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										>
											<Plus class="w-4 h-4 mr-2" />
											Add First Entry
										</button>
									</div>
								{/if}
							</div>
						{:else}
							{#each entries as entry (entry.id)}
								<div class="bg-white shadow-md rounded-lg p-3 md:p-4 mb-4">
									<div class="flex justify-between items-center">
										<p class="text-lg font-semibold text-gray-700">{data.user?.username}</p>
										<div class="flex items-center gap-2">
											<StarRating
												rating={entry.rating}
												readOnly={true}
												isEntryCard={true}
												size="w-4 h-4"
											/>
										</div>
									</div>

									<p
										class="text-gray-600 mt-2"
										class:line-clamp-2={!entry.showMore}
										class:line-clamp-none={entry.showMore}
									>
										{entry.note}
									</p>
									{#if (entry.note?.length ?? 0) > 100}
										<button
											onclick={() => (entry.showMore = !entry.showMore)}
											class="text-blue-500 text-sm cursor-pointer mt-1"
											aria-label="Toggle full review text"
										>
											{entry.showMore ? 'Less' : 'More'}
										</button>
									{/if}

									{#if Array.isArray(entry.tags) && entry.tags.length > 0}
										<div class="flow-root mt-4">
											<p class="float-right text-sm text-gray-500 pl-2">
												{timeAgo(entry.xata.createdAt)}
											</p>
											<div class="flex flex-wrap gap-2">
												{#each entry.tags as tagString}
													{@const tagObject = tags.find((t) => t.name === tagString)}
													{#if tagObject}
														{@const rgbColor = hexToRgb((tagObject.color ?? '') as string)}
														<span
															class="px-2 py-1 text-xs font-semibold rounded-md"
															style="--tag-color: {rgbColor}; --tag-color-dark: {darkenColor(
																(tagObject.color ?? '#e5e7eb') as string,
																40
															)};"
														>
															{tagString}
														</span>
													{/if}
												{/each}
											</div>
										</div>
									{:else}
										<div class="text-right text-sm text-gray-500 mt-2">
											{timeAgo(entry.xata.createdAt)}
										</div>
									{/if}
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/key}
{:else if loading}
	<div class="flex justify-center items-center h-screen">
		<Spinner />
	</div>
{:else}
	<p class="p-4 text-red-500 text-center">Employee not found.</p>
{/if}

<style>
	button[style*='--tag-color'] {
		background-color: rgba(var(--tag-color), 0.2);
		color: var(--tag-color-dark);
		border: 1px solid rgba(var(--tag-color), 0.3);
	}
	button[style*='--tag-color']:hover:not(.selected) {
		background-color: rgba(var(--tag-color), 0.8);
		color: var(--tag-color-dark);
	}
	button[style*='--tag-color'].selected {
		background-color: rgba(var(--tag-color), 0.8);
		color: var(--tag-color-dark);
		box-shadow: 0 0 0 2px var(--tag-color-dark);
		border-color: transparent;
	}
	span[style*='--tag-color'] {
		background-color: rgba(var(--tag-color), 0.8);
		color: var(--tag-color-dark);
		border: 1px solid transparent;
	}
</style>
