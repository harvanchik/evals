<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let employees = $derived(data.employees || []);
	let search = $state('');

	let filteredEmployees = $derived(
		employees.filter(
			(emp) =>
				(emp.first_name + ' ' + emp.last_name).toLowerCase().includes(search.toLowerCase()) ||
				(emp.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
				(emp.position || '').toLowerCase().includes(search.toLowerCase())
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
	<div class="mt-4">
		<input
			type="text"
			bind:value={search}
			placeholder="Search employees..."
			class="w-full p-2 border rounded"
		/>
	</div>

	<div class="mt-4">
		{#if filteredEmployees.length}
			<ul class="space-y-2">
				{#each filteredEmployees as employee (employee.id)}
					<li>
						<a
							href="/employees/{employee.id}"
							class="block p-4 bg-white rounded-md shadow hover:bg-gray-50"
						>
							<div class="font-bold text-gray-800">{employee.first_name} {employee.last_name}</div>
							<div class="text-sm text-gray-600">{employee.position}</div>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No employees found.</p>
		{/if}
	</div>
</div>
