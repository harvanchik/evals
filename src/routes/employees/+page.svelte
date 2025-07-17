<script lang="ts">
	import { onMount } from 'svelte';
	import { getEmployees } from '$lib/utils/localStorage';
	import type { Employee } from '$lib/types';

	let employees: Employee[] = $state([]);
	let search = $state('');

	onMount(() => {
		employees = getEmployees();
	});

	let filteredEmployees = $derived(
		employees.filter(
			(emp) =>
				emp.name.toLowerCase().includes(search.toLowerCase()) ||
				emp.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
				emp.department.toLowerCase().includes(search.toLowerCase())
		)
	);
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Employees</h1>
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
					{employee.name} - {employee.jobTitle} ({employee.department})
				</a>
			</li>
		{/each}
	</ul>
</div>
