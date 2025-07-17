<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getEmployees,
		getPerformanceEntries,
		savePerformanceEntries
	} from '$lib/utils/localStorage';
	import type { Employee, PerformanceEntry } from '$lib/types';
	import { page } from '$app/state';

	let employee: Employee | undefined = $state(undefined);
	let performanceEntries: PerformanceEntry[] = $state([]);
	let description = $state('');
	let rating = $state(0);
	let error = $state('');
	let success = $state('');

	onMount(() => {
		const employeeId = parseInt(page.url.pathname.split('/').pop() || '', 10);
		const employees = getEmployees();
		employee = employees.find((e: Employee) => e.id === employeeId);
		if (employee) {
			const allEntries = getPerformanceEntries();
			performanceEntries = allEntries.filter(
				(entry: PerformanceEntry) => entry.employeeId === employeeId
			);
		}
	});

	function addEntry(event: Event) {
		event.preventDefault();
		if (!description || rating < 1 || rating > 5) {
			error = 'Please provide a valid description and rating (1-5).';
			success = '';
			return;
		}

		if (employee) {
			const newEntry: PerformanceEntry = {
				id: Date.now(),
				employeeId: employee.id,
				date: new Date().toISOString(),
				description,
				rating
			};
			const allEntries = getPerformanceEntries();
			allEntries.push(newEntry);
			savePerformanceEntries(allEntries);
			performanceEntries.push(newEntry);
			success = 'Performance entry added successfully!';
			description = '';
			rating = 0;
			error = '';
		}
	}
</script>

{#if employee}
	<div class="p-4">
		<h1 class="text-2xl font-bold text-gray-800">{employee.name}</h1>
		<p class="text-gray-600">
			{employee.jobTitle} - {employee.department}
		</p>

		<div class="mt-8">
			<h2 class="text-xl font-bold text-gray-800">Performance Entries</h2>
			<ul class="space-y-4 mt-4">
				{#each performanceEntries as entry}
					<li class="p-4 bg-gray-50 rounded-md">
						<p class="text-gray-800">{entry.description}</p>
						<div class="flex justify-between items-center mt-2">
							<span class="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
							<span class="font-bold text-blue-500">Rating: {entry.rating}/5</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<div class="mt-8 p-4 bg-gray-50 rounded-md">
			<h2 class="text-lg font-semibold text-gray-800">Add Performance Entry</h2>
			{#if error}
				<p class="text-red-600">{error}</p>
			{/if}
			{#if success}
				<p class="text-green-600">{success}</p>
			{/if}
			<form onsubmit={addEntry} class="space-y-4">
				<label class="block">
					<span class="text-gray-700">Description</span>
					<textarea bind:value={description} class="w-full p-2 border rounded" required></textarea>
				</label>
				<label class="block">
					<span class="text-gray-700">Rating (1-5)</span>
					<input
						type="number"
						bind:value={rating}
						min="1"
						max="5"
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>Add Entry</button
				>
			</form>
		</div>
	</div>
{:else}
	<p>Employee not found.</p>
{/if}
