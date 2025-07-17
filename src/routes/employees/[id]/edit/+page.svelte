<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getEmployees, saveEmployees, getJobTitles } from '$lib/utils/localStorage';
	import type { Employee, JobTitle } from '$lib/types';
	import { page } from '$app/state';

	let employee: Employee | undefined = $state(undefined);
	let name = $state('');
	let jobTitle = $state('');
	let jobTitles: JobTitle[] = $state([]);

	onMount(() => {
		const employeeId = parseInt(page.url.pathname.split('/')[2], 10);
		const employees = getEmployees();
		employee = employees.find((e: Employee) => e.id === employeeId);
		if (employee) {
			name = employee.name;
			jobTitle = employee.jobTitle;
		}
		jobTitles = getJobTitles();
	});

	function updateEmployee(event: Event) {
		event.preventDefault();
		if (employee) {
			const employees = getEmployees();
			const index = employees.findIndex((e: Employee) => e.id === employee!.id);
			if (index !== -1) {
				employees[index] = { ...employee, name, jobTitle };
				saveEmployees(employees);
				goto(`/employees/${employee.id}`);
			}
		}
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Edit Employee</h1>
	{#if employee}
		<form onsubmit={updateEmployee} class="space-y-4 mt-4">
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
				>Update Employee</button
			>
		</form>
	{:else}
		<p>Employee not found.</p>
	{/if}
</div>
