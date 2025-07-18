<script lang="ts">
	import type { PageProps } from './$types';
	import ColorInput from '$lib/components/ColorInput.svelte';

	let { data, form }: PageProps = $props();

	let positions = $derived(data.positions || []);
	let color = $state('#000000');
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Job Titles</h1>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
		<div class="md:col-span-2">
			<h2 class="text-xl font-semibold text-gray-700">Existing Titles</h2>
			{#if positions.length}
				<ul class="space-y-2 mt-2">
					{#each positions as position (position.id)}
						<li class="p-4 bg-white rounded-md shadow flex items-center">
							<div
								class="w-4 h-4 rounded-full mr-4"
								style:background-color={position.color || '#ccc'}
							></div>
							<div class="flex-grow">
								<div class="font-bold text-gray-800">{position.title}</div>
								<div class="text-sm text-gray-600">{position.description}</div>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No job titles found.</p>
			{/if}
		</div>
		<div>
			<h2 class="text-xl font-semibold text-gray-700">Add New Title</h2>
			<form method="POST" class="p-4 bg-white rounded-md shadow mt-2">
				<div class="mb-4">
					<label for="title" class="block text-sm font-medium text-gray-700">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="description" class="block text-sm font-medium text-gray-700"
						>Description</label
					>
					<textarea
						id="description"
						name="description"
						rows="3"
						class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					></textarea>
				</div>
				<div class="mb-4">
					<label for="color" class="block text-sm font-medium text-gray-700">Color</label>
					<ColorInput bind:value={color} />
					<input type="hidden" name="color" value={color} />
				</div>
				<button
					type="submit"
					class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Add Position
				</button>
				{#if form?.success}
					<p class="text-green-500 text-sm mt-2">Position added successfully!</p>
				{/if}
				{#if form?.error}
					<p class="text-red-500 text-sm mt-2">{form.error}</p>
				{/if}
			</form>
		</div>
	</div>
</div>
