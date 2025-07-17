<script lang="ts">
	import { onMount } from 'svelte';
	import { getJobTitles, saveJobTitles } from '$lib/utils/localStorage';
	import type { JobTitle } from '$lib/types';
	import ColorInput from '$lib/components/ColorInput.svelte';

	let jobTitles: JobTitle[] = $state([]);
	let newTitle = $state('');
	let newDescription = $state('');
	let newColor = $state('#000000');
	let editingTitle: JobTitle | null = $state(null);

	onMount(() => {
		jobTitles = getJobTitles();
	});

	function addJobTitle(event: Event) {
		event.preventDefault();
		if (newTitle && !jobTitles.find((t) => t.name === newTitle)) {
			const newId = jobTitles.length > 0 ? Math.max(...jobTitles.map((t) => t.id)) + 1 : 1;
			jobTitles.push({
				id: newId,
				name: newTitle,
				description: newDescription,
				color: newColor
			});
			saveJobTitles(jobTitles);
			newTitle = '';
			newDescription = '';
			newColor = '#000000';
		}
	}

	function deleteJobTitle(id: number) {
		if (confirm('Are you sure you want to delete this job title?')) {
			jobTitles = jobTitles.filter((t) => t.id !== id);
			saveJobTitles(jobTitles);
		}
	}

	function startEditing(title: JobTitle) {
		editingTitle = { ...title };
	}

	function cancelEditing() {
		editingTitle = null;
	}

	function updateJobTitle(event: Event) {
		event.preventDefault();
		if (editingTitle) {
			const index = jobTitles.findIndex((t) => t.id === editingTitle!.id);
			if (index !== -1) {
				jobTitles[index] = editingTitle;
				saveJobTitles(jobTitles);
				editingTitle = null;
			}
		}
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Job Titles</h1>
	<form onsubmit={addJobTitle} class="space-y-4 mt-4">
		<label class="block">
			<span class="text-gray-700">New Job Title</span>
			<input type="text" bind:value={newTitle} class="w-full p-2 border rounded" required />
		</label>
		<label class="block">
			<span class="text-gray-700">Description</span>
			<textarea bind:value={newDescription} class="w-full p-2 border rounded"></textarea>
		</label>
		<label class="block">
			<span class="text-gray-700">Color</span>
			<ColorInput bind:value={newColor} />
		</label>
		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Add Job Title</button
		>
	</form>
	<ul class="mt-4 space-y-2">
		{#each jobTitles as title}
			<li class="p-2 bg-gray-50 rounded">
				{#if editingTitle && editingTitle.id === title.id}
					<form onsubmit={updateJobTitle} class="space-y-4">
						<label class="block">
							<span class="text-gray-700">Name</span>
							<input
								type="text"
								bind:value={editingTitle!.name}
								class="w-full p-2 border rounded"
								required
							/>
						</label>
						<label class="block">
							<span class="text-gray-700">Description</span>
							<textarea bind:value={editingTitle!.description} class="w-full p-2 border rounded"
							></textarea>
						</label>
						<label class="block">
							<span class="text-gray-700">Color</span>
							<ColorInput bind:value={editingTitle!.color} />
						</label>
						<button
							type="submit"
							class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button
						>
						<button
							type="button"
							onclick={cancelEditing}
							class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2">Cancel</button
						>
					</form>
				{:else}
					<div class="flex justify-between items-center">
						<div>
							<h3 class="font-bold" style="color: {title.color};">{title.name}</h3>
							<p>{title.description}</p>
						</div>
						<div>
							<button
								onclick={() => startEditing(title)}
								class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button
							>
							<button
								onclick={() => deleteJobTitle(title.id)}
								class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
							>
								Delete
							</button>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>
