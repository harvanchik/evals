<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	let { data }: PageProps = $props();

	let employee = $derived(data.employees.find((e) => e.id === page.params.id));

	// Placeholder for when performance entries are moved to Xata
	let performanceEntries = $derived([]);
	let avgRating = $derived(0);
</script>

{#if employee}
	<div class="p-4">
		<a href="/employees" class="text-blue-500 hover:underline mb-4 inline-block"> &larr; Back </a>
		<h1 class="text-2xl font-bold text-gray-800">
			{employee.nickname || employee.first_name}
			{employee.last_name}
			{#if employee.nickname}
				<span class="text-lg text-gray-500">({employee.first_name} {employee.last_name})</span>
			{/if}
		</h1>
		<span class="px-2 py-1 text-xs font-semibold text-white rounded-full bg-gray-500">
			{employee.position}
		</span>

		<div class="mt-8">
			<h2 class="text-xl font-bold text-gray-800">Performance Entries</h2>
			<div class="flex space-x-4 text-sm text-gray-600 mb-4">
				<span>Total Entries: {performanceEntries.length}</span>
				{#if performanceEntries.length > 0}
					<span>Average Rating: {avgRating.toFixed(1)}/5</span>
				{/if}
			</div>
			<p>Performance entries coming soon...</p>
		</div>
	</div>
{:else}
	<p>Employee not found.</p>
{/if}
