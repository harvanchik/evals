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
		(data.entries && typeof data.entries.toSerializable === 'function'
			? data.entries.toSerializable()
			: data.entries || []
		).map((entry) => ({ ...entry, showMore: false }))
	);

	let tags = $derived((Array.isArray(rawTags) ? rawTags : []).filter((t) => t && t.name));

	let loading = $state(false);
	let mobileFormVisible = $state(false);
	let newEntry = $state({
		note: '',
		rating: 3,
		tags: [] as string[]
	});

	const positionColors: { [key: string]: string } = {
		manager: 'border-blue-500',
		developer: 'border-green-500',
		designer: 'border-purple-500'
	};

	const positionColorClass = $derived(
		positionColors[employee?.position?.toLowerCase() ?? ''] ?? 'border-gray-500'
	);

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
	<div class="font-sans">
		<a href="/employees" class="text-blue-500 hover:underline px-4 py-6 md:px-6 md:py-8"
			>&larr; Back to Employees</a
		>
		<h1
			class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center mt-6 md:mt-8 pb-2 border-b-4 {positionColorClass}"
		>
			{employee.nickname || employee.first_name}
			{employee.last_name}
		</h1>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
			<!-- Create New Entry Form -->
			<div class="md:sticky md:top-8 h-fit">
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
							await update({ reset: false });
							if (result.type === 'success' && result.status === 200) {
								entries.unshift({
									...newEntry,
									id: `temp_${Date.now()}`,
									xata: {
										createdAt: new Date(),
										updatedAt: new Date(),
										version: 0
									},
									showMore: false
								} as any);
								newEntry = { note: '', rating: 3, tags: [] };
								mobileFormVisible = false;
							}
							loading = false;
						};
					}}
				>
					<fieldset class="block">
						<legend class="text-gray-700">Rating</legend>
						<StarRating bind:rating={newEntry.rating} />
						<input type="hidden" name="rating" value={newEntry.rating} />
					</fieldset>

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
			<div class="md:col-span-2">
				<div class="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
					{#each entries as entry (entry.id)}
						<div class="bg-white shadow-md rounded-lg p-3 md:p-4 mb-4">
							<div class="flex justify-between items-center">
								<p class="text-lg font-semibold text-gray-700">{data.user?.username}</p>
								<div class="flex items-center gap-2">
									<StarRating rating={entry.rating} readOnly={true} size="w-4 h-4" />
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
				</div>
			</div>
		</div>
	</div>
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
