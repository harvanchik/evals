<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getEmployees, saveEmployees, getJobTitles } from '$lib/utils/localStorage';
	import type { Employee, JobTitle } from '$lib/types';

	let name = $state('');
	let jobTitle = $state('');
	let jobTitles: JobTitle[] = $state([]);

	onMount(() => {
		jobTitles = getJobTitles();
		if (jobTitles.length > 0) {
			jobTitle = jobTitles[0].name;
		}
	});

	function createEmployee(event: Event) {
		event.preventDefault();
		const employees = getEmployees();
		const newEmployee: Employee = {
			id: Date.now(),
			name,
			jobTitle,
			archived: false
		};
		employees.push(newEmployee);
		saveEmployees(employees);
		goto('/employees');
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Create New Employee</h1>
	<form onsubmit={createEmployee} class="space-y-4 mt-4">
		<label class="block">
			<span class="text-gray-700">Name</span>
			<input type="text" bind:value={name} class="w-full p-2 border rounded" required />
		</label>
		<label class="block">
			<span class="text-gray-700">Job Title</span>
			<select bind:value={jobTitle} class="w-full p-2 border rounded">
				{#each jobTitles as title}
					<option value={title.name}>{title.name}</option>
				{/each}
			</select>
		</label>
		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Create Employee</button
		>
	</form>
</div>
