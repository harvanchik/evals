<script lang="ts">
	import { onMount } from 'svelte';
	import { getEmployees, saveEmployees } from '$lib/utils/localStorage';
	import type { Employee } from '$lib/types';

	let archivedEmployees: Employee[] = $state([]);

	onMount(() => {
		archivedEmployees = getEmployees().filter((e) => e.archived);
	});

	function reinstateEmployee(id: number) {
		const employees = getEmployees();
		const index = employees.findIndex((e: Employee) => e.id === id);
		if (index !== -1) {
			employees[index].archived = false;
			saveEmployees(employees);
			archivedEmployees = archivedEmployees.filter((e) => e.id !== id);
		}
	}

	function deleteEmployee(id: number) {
		const employees = getEmployees().filter((e) => e.id !== id);
		saveEmployees(employees);
		archivedEmployees = archivedEmployees.filter((e) => e.id !== id);
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Archived Employees</h1>
	<ul class="space-y-2 mt-4">
		{#each archivedEmployees as employee}
			<li class="p-2 bg-gray-50 rounded flex justify-between items-center">
				<a href="/employees/{employee.id}" class="text-blue-500 hover:underline"
					>{employee.nickname || employee.firstName} {employee.lastName} - {employee.jobTitle}</a
				>
				<div>
					<button
						onclick={() => reinstateEmployee(employee.id)}
						class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">Reinstate</button
					>
					<button
						onclick={() => deleteEmployee(employee.id)}
						class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
						>Delete Permanently</button
					>
				</div>
			</li>
		{/each}
	</ul>
</div>
