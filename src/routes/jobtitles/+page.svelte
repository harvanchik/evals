<script context="module">
	declare const lucide: any;
</script>

<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import ColorInput from '$lib/components/ColorInput.svelte';

	let { data, form }: PageProps = $props();
	let positions = $derived(data.positions || []);

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
	}

	function startEditing(position: (typeof positions)[0]) {
		editingPositionId = position.id;
		newPosition.title = position.title;
		newPosition.description = position.description || '';
		newPosition.color = position.color || '#cccccc';
	}

	$effect(() => {
		if (positions && typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	});
</script>

<svelte:head>
	<title>Positions</title>
</svelte:head>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Positions</h1>

	<div class="grid md:grid-cols-2 gap-8 mt-4">
		<div>
			<h2 class="text-xl font-semibold text-gray-700 mb-2">
				{#if editingPositionId}Edit Position{:else}Add New Position{/if}
			</h2>
			<form
				method="POST"
				action={editingPositionId ? `?/updatePosition&id=${editingPositionId}` : '?/createPosition'}
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							handleReset();
						}
						await update({ reset: false });
					};
				}}
				class="space-y-4 p-4 border rounded"
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
				<ColorInput bind:value={newPosition.color} />
				<input type="hidden" name="color" value={newPosition.color} />

				<div class="flex items-center space-x-2">
					<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						{#if editingPositionId}Save Changes{:else}Add Position{/if}
					</button>
					{#if editingPositionId}
						<button
							type="button"
							onclick={handleReset}
							class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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
			<h2 class="text-xl font-semibold text-gray-700 mb-2">Existing Positions</h2>
			<ul class="space-y-2">
				{#each positions as position (position.id)}
					<li
						class="p-4 rounded-lg shadow flex justify-between items-center"
						style:border-left="4px solid {position.color || '#cccccc'}"
					>
						<div>
							<p class="font-bold">{position.title}</p>
							<p class="text-sm text-gray-600">{position.description}</p>
						</div>
						<div class="flex space-x-2">
							<button
								onclick={() => startEditing(position)}
								class="text-gray-500 hover:text-blue-600"
							>
								<i data-lucide="pencil" class="w-4 h-4"></i>
							</button>
							<form
								method="POST"
								action="?/deletePosition&id={position.id}"
								use:enhance={({ cancel }) => {
									if (!confirm('Are you sure you want to delete this position?')) {
										cancel();
									}
									return async ({ update }) => {
										await update({ reset: false });
									};
								}}
							>
								<button type="submit" class="text-gray-500 hover:text-red-600">
									<i data-lucide="trash-2" class="w-4 h-4"></i>
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
