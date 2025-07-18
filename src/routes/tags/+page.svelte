<script lang="ts">
	import { onMount } from 'svelte';
	import { getTags, saveTags, initializeMockData } from '$lib/utils/localStorage';
	import type { Tag } from '$lib/types';

	let tags: Tag[] = $state([]);
	let newTag = $state('');
	let editingTag: Tag | null = $state(null);

	onMount(() => {
		initializeMockData();
		tags = getTags();
	});

	function addTag(event: Event) {
		event.preventDefault();
		if (newTag && !tags.find((t) => t.name === newTag)) {
			const newId = tags.length > 0 ? Math.max(...tags.map((t) => t.id)) + 1 : 1;
			tags.push({ id: newId, name: newTag });
			saveTags(tags);
			newTag = '';
		}
	}

	function deleteTag(id: number) {
		if (confirm('Are you sure you want to delete this tag?')) {
			tags = tags.filter((t) => t.id !== id);
			saveTags(tags);
		}
	}

	function startEditing(tag: Tag) {
		editingTag = { ...tag };
	}

	function cancelEditing() {
		editingTag = null;
	}

	function updateTag(event: Event) {
		event.preventDefault();
		if (editingTag) {
			const index = tags.findIndex((t) => t.id === editingTag!.id);
			if (index !== -1) {
				tags[index] = editingTag;
				saveTags(tags);
				editingTag = null;
			}
		}
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Manage Tags</h1>
	<form onsubmit={addTag} class="space-y-4 mt-4">
		<label class="block">
			<span class="text-gray-700">New Tag</span>
			<input type="text" bind:value={newTag} class="w-full p-2 border rounded" required />
		</label>
		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Add Tag</button
		>
	</form>
	<ul class="mt-4 space-y-2">
		{#each tags as tag}
			<li class="p-2 bg-gray-50 rounded">
				{#if editingTag && editingTag.id === tag.id}
					<form onsubmit={updateTag} class="space-y-4">
						<input
							type="text"
							bind:value={editingTag.name}
							class="w-full p-2 border rounded"
							required
						/>
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
						<span>{tag.name}</span>
						<div>
							<button
								onclick={() => startEditing(tag)}
								class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button
							>
							<button
								onclick={() => deleteTag(tag.id)}
								class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2">Delete</button
							>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>
