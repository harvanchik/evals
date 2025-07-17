<script lang="ts">
	import { onMount } from 'svelte';
	import { getEmployees } from '$lib/utils/localStorage';
	import type { Employee } from '$lib/types';

	let employees: Employee[] = $state([]);
	let search = $state('');

	onMount(() => {
		employees = getEmployees().filter((e) => !e.archived);
	});

	let filteredEmployees = $derived(
		employees.filter(
			(emp) =>
				emp.name.toLowerCase().includes(search.toLowerCase()) ||
				emp.jobTitle.toLowerCase().includes(search.toLowerCase())
		)
	);
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Employees</h1>
	<a href="/employees/new" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
		>Create Employee</a
	>
	<a
		href="/employees/archived"
		class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 ml-2">View Archived</a
	>
	<input
		type="text"
		bind:value={search}
		placeholder="Search by name, job title, or department"
		class="w-full p-2 mb-4 border rounded"
	/>
	<ul class="space-y-2">
		{#each filteredEmployees as employee}
			<li class="p-2 bg-gray-50 rounded">
				<a href="/employees/{employee.id}" class="text-blue-500 hover:underline">
					{employee.name} - {employee.jobTitle}
				</a>
			</li>
		{/each}
	</ul>
</div>
