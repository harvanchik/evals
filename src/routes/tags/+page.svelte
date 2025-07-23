<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import ColorInput from '$lib/components/ColorInput.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { Plus, Minus } from 'lucide-svelte';

	let { data, form }: PageProps = $props();
	let tags = $derived(data.tags || []);
	let search = $state('');
	let loading = $state(false);
	let mobileFormVisible = $state(false);

	let formState = $state({
		id: null as string | null,
		name: '',
		description: '',
		color: '#cccccc'
	});

	function handleReset() {
		formState.id = null;
		formState.name = '';
		formState.description = '';
		formState.color = '#cccccc';
		mobileFormVisible = false;
	}

	function startEditing(tag: (typeof tags)[0]) {
		formState.id = tag.id;
		formState.name = tag.name ?? '';
		formState.description = tag.description ?? '';
		formState.color = tag.color ?? '#cccccc';
		mobileFormVisible = true;
	}

	$effect(() => {
		mobileFormVisible;
		formState.id;
		if (typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	});

	let filteredTags = $derived(
		tags.filter((tag) => {
			const name = typeof tag.name === 'string' ? tag.name : '';
			const description = typeof tag.description === 'string' ? tag.description : '';
			const searchTerm = search.toLowerCase();
			return (
				name.toLowerCase().includes(searchTerm) || description.toLowerCase().includes(searchTerm)
			);
		})
	);
</script>

<svelte:head>
	<title>Tags</title>
</svelte:head>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Manage Tags</h1>

	<div class="grid md:grid-cols-2 gap-8 mt-4">
		<div>
			<div
				class="flex items-center mb-2 cursor-pointer md:cursor-auto"
				onclick={() => (mobileFormVisible = !mobileFormVisible)}
				onkeypress={() => (mobileFormVisible = !mobileFormVisible)}
				role="button"
				tabindex="0"
			>
				<h2 class="text-xl font-semibold text-gray-700">
					{#if formState.id}Edit Tag{:else}Add New Tag{/if}
				</h2>
				<span class="md:hidden ml-2">
					{#if mobileFormVisible || formState.id}
						<Minus />
					{:else}
						<Plus />
					{/if}
				</span>
			</div>
			<form
				method="POST"
				action={formState.id ? `?/updateTag&id=${formState.id}` : '?/createTag'}
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						if (result.type === 'success') {
							handleReset();
						}
						await update({ reset: false });
						loading = false;
					};
				}}
				class:hidden={!mobileFormVisible && !formState.id}
				class="md:block space-y-4 p-4 border rounded"
			>
				<label class="block">
					<span class="text-gray-700">Name</span>
					<input
						type="text"
						name="name"
						bind:value={formState.name}
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Description (Optional)</span>
					<textarea
						name="description"
						bind:value={formState.description}
						class="w-full p-2 border rounded"
						rows="3"
					></textarea>
				</label>
				<label class="block">
					<span class="text-gray-700">Color</span>
					<ColorInput bind:value={formState.color} />
				</label>
				<input type="hidden" name="color" value={formState.color} />
				<div class="flex items-center space-x-2">
					<button
						type="submit"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-36 h-10 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
						disabled={loading}
					>
						{#if loading}
							<Spinner />
						{:else if formState.id}
							Save Changes
						{:else}
							Add Tag
						{/if}
					</button>
					{#if formState.id}
						<button
							type="button"
							onclick={handleReset}
							class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
						>
							Cancel
						</button>
					{/if}
				</div>
				{#if form?.error}
					<p class="text-red-500">{form.error}</p>
				{/if}
			</form>
		</div>
		<div>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-gray-700">Tags</h2>
				<input
					type="text"
					bind:value={search}
					placeholder="Search tags..."
					class="w-full ml-5 p-2 border rounded"
				/>
			</div>
			{#if filteredTags.length}
				<ul class="space-y-2">
					{#each filteredTags as tag (tag.id)}
						<li
							class="p-4 rounded-lg shadow flex justify-between items-center"
							style:border-left="4px solid {tag.color || '#cccccc'}"
						>
							<div>
								<p class="font-bold">{tag.name}</p>
								<p class="text-sm text-gray-600">{tag.description}</p>
							</div>
							<div class="flex items-center space-x-3">
								<button
									onclick={() => startEditing(tag)}
									class="text-gray-500 hover:text-blue-600 cursor-pointer"
									aria-label="Edit tag"
								>
									<i data-lucide="pencil" class="w-5 h-5"></i>
								</button>
								<form
									class="items-center flex"
									method="POST"
									action="?/deleteTag&id={tag.id}"
									use:enhance={({ cancel }) => {
										if (!confirm('Are you sure you want to delete this tag?')) {
											cancel();
										}
										loading = true;
										return async ({ update }) => {
											await update({ reset: false });
											loading = false;
										};
									}}
								>
									<button
										type="submit"
										class="text-gray-500 hover:text-red-600 cursor-pointer disabled:cursor-not-allowed"
										aria-label="Delete tag"
										disabled={loading}
									>
										<i data-lucide="trash-2" class="w-5 h-5"></i>
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No tags found.</p>
			{/if}
		</div>
	</div>
</div>
