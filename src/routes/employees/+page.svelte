<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getEmployees,
		saveEmployees,
		getPerformanceEntries,
		savePerformanceEntries,
		getJobTitles
	} from '$lib/utils/localStorage';
	import type { Employee, JobTitle } from '$lib/types';

	let employees: Employee[] = $state([]);
	let search = $state('');
	let selectedEmployeeIds = $state<number[]>([]);
	let jobTitles: JobTitle[] = $state([]);
	let selectedJobTitle = $state('');

	onMount(() => {
		employees = getEmployees().filter((e) => !e.archived);
		jobTitles = getJobTitles();
	});

	let filteredEmployees = $derived(
		employees.filter(
			(emp) =>
				(emp.firstName + ' ' + emp.lastName).toLowerCase().includes(search.toLowerCase()) ||
				(emp.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
				emp.jobTitle.toLowerCase().includes(search.toLowerCase())
		)
	);

	function toggleEmployeeSelection(employeeId: number) {
		if (selectedEmployeeIds.includes(employeeId)) {
			selectedEmployeeIds = selectedEmployeeIds.filter((id) => id !== employeeId);
		} else {
			selectedEmployeeIds.push(employeeId);
		}
	}

	function archiveSelected() {
		if (!confirm(`Are you sure you want to archive ${selectedEmployeeIds.length} employee(s)?`)) {
			return;
		}
		const updatedEmployees = employees.map((emp) => {
			if (selectedEmployeeIds.includes(emp.id)) {
				return { ...emp, archived: true };
			}
			return emp;
		});
		saveEmployees(updatedEmployees);
		employees = updatedEmployees.filter((e) => !e.archived);
		selectedEmployeeIds = [];
	}

	function clearEntries() {
		if (
			!confirm(
				`Are you sure you want to clear all performance entries for ${selectedEmployeeIds.length} employee(s)? This action cannot be undone.`
			)
		) {
			return;
		}
		const allEntries = getPerformanceEntries();
		const updatedEntries = allEntries.filter(
			(entry) => !selectedEmployeeIds.includes(entry.employeeId)
		);
		savePerformanceEntries(updatedEntries);
		selectedEmployeeIds = [];
		// Optionally, you might want to provide feedback to the user
		alert('Performance entries cleared successfully.');
	}

	function changeJobTitle() {
		if (!selectedJobTitle) {
			alert('Please select a job title.');
			return;
		}
		const updatedEmployees = employees.map((emp) => {
			if (selectedEmployeeIds.includes(emp.id)) {
				return { ...emp, jobTitle: selectedJobTitle };
			}
			return emp;
		});
		saveEmployees(updatedEmployees);
		employees = updatedEmployees;
		selectedEmployeeIds = [];
		selectedJobTitle = '';
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800 mb-4">Employees</h1>
	<div class="space-x-2 mb-4">
		<a href="/employees/new" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Create Employee</a
		>
		<a href="/employees/bulk" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
			>Bulk Add Employees</a
		>
		<a
			href="/employees/archived"
			class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">View Archived</a
		>
	</div>

	{#if selectedEmployeeIds.length > 0}
		<div class="mb-4 p-4 bg-gray-100 rounded-lg space-y-4">
			<h2 class="text-lg font-bold">{selectedEmployeeIds.length} employee(s) selected</h2>
			<div class="flex flex-wrap items-center gap-4">
				<button
					onclick={archiveSelected}
					class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
				>
					Archive Selected
				</button>
				<button
					onclick={clearEntries}
					class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
				>
					Clear All Entries
				</button>
				<div class="flex items-center gap-2">
					<select
						bind:value={selectedJobTitle}
						class="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					>
						<option value="" disabled>Select Job Title</option>
						{#each jobTitles as title}
							<option value={title.name}>{title.name}</option>
						{/each}
					</select>
					<button
						onclick={changeJobTitle}
						class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
						disabled={!selectedJobTitle}>Change Job Title</button
					>
				</div>
			</div>
		</div>
	{/if}

	<input
		type="text"
		bind:value={search}
		placeholder="Search by name, job title, or department"
		class="w-full p-2 mb-4 border rounded"
	/>
	<ul class="space-y-2">
		{#each filteredEmployees as employee}
			<li
				class="p-2 rounded flex items-center gap-3 {selectedEmployeeIds.includes(employee.id)
					? 'bg-blue-100'
					: 'bg-gray-50'}"
			>
				<input
					type="checkbox"
					checked={selectedEmployeeIds.includes(employee.id)}
					onchange={() => toggleEmployeeSelection(employee.id)}
					class="h-4 w-4"
				/>
				<a href="/employees/{employee.id}" class="text-blue-500 hover:underline flex-grow">
					{employee.nickname || employee.firstName}
					{employee.lastName} - {employee.jobTitle}
				</a>
			</li>
		{/each}
	</ul>
</div>
