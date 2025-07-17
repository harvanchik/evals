<script lang="ts">
	import { onMount } from 'svelte';
	import { getJobTitles, saveJobTitles } from '$lib/utils/localStorage';
	import type { JobTitle } from '$lib/types';

	let jobTitles: JobTitle[] = $state([]);
	let newTitle = $state('');

	onMount(() => {
		jobTitles = getJobTitles();
	});

	function addJobTitle(event: Event) {
		event.preventDefault();
		if (newTitle && !jobTitles.find((t) => t.name === newTitle)) {
			const newId = jobTitles.length > 0 ? Math.max(...jobTitles.map((t) => t.id)) + 1 : 1;
			jobTitles.push({ id: newId, name: newTitle });
			saveJobTitles(jobTitles);
			newTitle = '';
		}
	}

	function deleteJobTitle(id: number) {
		jobTitles = jobTitles.filter((t) => t.id !== id);
		saveJobTitles(jobTitles);
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Job Titles</h1>
	<form onsubmit={addJobTitle} class="space-y-4 mt-4">
		<label class="block">
			<span class="text-gray-700">New Job Title</span>
			<input type="text" bind:value={newTitle} class="w-full p-2 border rounded" required />
		</label>
		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Add Job Title</button
		>
	</form>
	<ul class="mt-4 space-y-2">
		{#each jobTitles as title}
			<li class="p-2 bg-gray-50 rounded flex justify-between items-center">
				<span>{title.name}</span>
				<button
					onclick={() => deleteJobTitle(title.id)}
					class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
				>
					Delete
				</button>
			</li>
		{/each}
	</ul>
</div>
