<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import ColorInput from '$lib/components/ColorInput.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { Plus, Minus, Pencil, Trash2 } from 'lucide-svelte';
	import { positions as positionsStore } from '$lib/stores/positions';
	import { invalidateAll } from '$app/navigation';

	let { data, form }: PageProps = $props();
	let positions = $derived(data.positions || []);
	let search = $state('');
	let loading = $state(false);
	let mobileFormVisible = $state(false);

	let editingPositionId = $state<string | null>(null);
	let newPosition = $state({
		title: '',
		description: '',
		color: '#cccccc'
	});

	function handleReset() {
		newPosition.title = '';
		newPosition.description = '';
		newPosition.color = '#cccccc';
		editingPositionId = null;
		mobileFormVisible = false;
	}

	function startEditing(position: (typeof positions)[0]) {
		editingPositionId = position.id;
		newPosition.title = typeof position.title === 'string' ? position.title : '';
		newPosition.description = typeof position.description === 'string' ? position.description : '';
		newPosition.color = typeof position.color === 'string' ? position.color : '#cccccc';
		mobileFormVisible = true;
	}

	let filteredPositions = $derived(
		positions.filter((pos) => {
			const title = typeof pos.title === 'string' ? pos.title : '';
			const description = typeof pos.description === 'string' ? pos.description : '';
			const searchTerm = search.toLowerCase();
			return (
				title.toLowerCase().includes(searchTerm) || description.toLowerCase().includes(searchTerm)
			);
		})
	);

	$effect(() => {
		if (typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	});
</script>

<svelte:head>
	<title>Positions</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-gray-800">Positions</h1>

	<div class="grid md:grid-cols-2 gap-8 mt-4">
		{#if data.isAdmin}
			<div>
				<div
					class="flex items-center mb-2 cursor-pointer md:cursor-auto"
					onclick={() => (mobileFormVisible = !mobileFormVisible)}
					onkeypress={() => (mobileFormVisible = !mobileFormVisible)}
					role="button"
					tabindex="0"
				>
					<h2 class="text-xl font-semibold text-gray-700">
						{#if editingPositionId}Edit Position{:else}Add New Position{/if}
					</h2>
					<span class="md:hidden ml-2">
						{#if mobileFormVisible || editingPositionId}
							<Minus />
						{:else}
							<Plus />
						{/if}
					</span>
				</div>
				<form
					method="POST"
					action={editingPositionId
						? `?/updatePosition&id=${editingPositionId}`
						: '?/createPosition'}
					use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							if (result.type === 'success') {
								handleReset();
								// Invalidate all data to refresh positions in layout
								await invalidateAll();
							}
							await update({ reset: false });
							loading = false;
						};
					}}
					class:hidden={!mobileFormVisible && !editingPositionId}
					class="md:block space-y-4 p-4 border rounded"
				>
					<label class="block">
						<span class="text-gray-700">Title</span>
						<input
							type="text"
							name="title"
							bind:value={newPosition.title}
							class="w-full p-2 border rounded"
							required
						/>
					</label>
					<label class="block">
						<span class="text-gray-700">Description (Optional)</span>
						<textarea
							name="description"
							bind:value={newPosition.description}
							class="w-full p-2 border rounded"
							rows="3"
						></textarea>
					</label>
					<label class="block">
						<span class="text-gray-700">Color</span>
						<ColorInput bind:value={newPosition.color} />
					</label>
					<input type="hidden" name="color" value={newPosition.color} />

					<div class="flex items-center space-x-2">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-36 h-10 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
							disabled={loading}
						>
							{#if loading}
								<Spinner />
							{:else if editingPositionId}
								Save Changes
							{:else}
								Add Position
							{/if}
						</button>
						{#if editingPositionId}
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
		{/if}
		<div class:md:col-span-2={!data.isAdmin}>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-gray-700">Existing Positions</h2>
				<input
					type="text"
					bind:value={search}
					placeholder="Search positions..."
					class="w-1/2 p-2 border rounded"
				/>
			</div>
			{#if filteredPositions.length}
				<ul class="space-y-2">
					{#each filteredPositions as position (position.id)}
						<li
							class="p-4 rounded-lg shadow flex justify-between items-center"
							style:border-left="4px solid {position.color || '#cccccc'}"
						>
							<div>
								<p class="font-bold">{position.title}</p>
								<p class="text-sm text-gray-600">{position.description}</p>
							</div>
							{#if data.isAdmin}
								<div class="flex items-center space-x-3">
									<button
										onclick={() => startEditing(position)}
										class="text-gray-500 hover:text-blue-600 cursor-pointer"
										aria-label="Edit position"
									>
										<Pencil class="w-5 h-5" />
									</button>
									<form
										class="items-center flex"
										method="POST"
										action="?/deletePosition&id={position.id}"
										use:enhance={({ cancel }) => {
											if (!confirm('Are you sure you want to delete this position?')) {
												cancel();
											}
											loading = true;
											return async ({ result, update }) => {
												if (result.type === 'success') {
													// Invalidate all data to refresh positions in layout
													await invalidateAll();
												}
												await update({ reset: false });
												loading = false;
											};
										}}
									>
										<button
											type="submit"
											class="text-gray-500 hover:text-red-600 cursor-pointer disabled:cursor-not-allowed"
											aria-label="Delete position"
											disabled={loading}
										>
											<Trash2 class="w-5 h-5" />
										</button>
									</form>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No positions found.</p>
			{/if}
		</div>
	</div>
</div>
