<script lang="ts">
	import type { PageProps } from './$types';
	import SummaryCard from '$lib/components/SummaryCard.svelte';

	let { data }: PageProps = $props();

	let employees = $derived(data.employees || []);
	let performanceEntries = $derived(data.performanceEntries || []);
	let search = $state('');

	let filteredEmployees = $derived(
		employees.filter(
			(emp) =>
				(emp.first_name + ' ' + emp.last_name).toLowerCase().includes(search.toLowerCase()) ||
				(emp.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
				(emp.position || '').toLowerCase().includes(search.toLowerCase())
		)
	);

	const activeEmployees = $derived(employees.filter((e) => !e.archived));
	const totalEntries = $derived(performanceEntries.length);
	const averageRating = $derived(0); // Placeholder until entries are in Xata
	const notEvaluatedCount = $derived(
		activeEmployees.filter(
			(emp) => !performanceEntries.some((entry) => entry.employeeId === emp.id)
		).length
	);
</script>

<svelte:head>
	<title>EPT - Dashboard</title>
	<meta name="description" content="Employee Performance Tracker Dashboard" />
</svelte:head>

<section>
	<div class="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
		<SummaryCard title="Active Employees" value={activeEmployees.length} />
		<SummaryCard title="Entries Written" value={totalEntries} />
		<SummaryCard title="Average Rating" value={averageRating.toFixed(2)} />
		<SummaryCard title="Not Evaluated" value={notEvaluatedCount} />
	</div>

	<div class="mb-4">
		<input
			type="text"
			bind:value={search}
			placeholder="Search employees..."
			class="w-full p-2 border rounded"
		/>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredEmployees as employee (employee.id)}
			<a
				href="/employees/{employee.id}"
				class="block p-4 bg-white rounded-md shadow hover:bg-gray-50"
			>
				<div class="font-bold text-gray-800">{employee.first_name} {employee.last_name}</div>
				<div class="text-sm text-gray-600">{employee.position}</div>
			</a>
		{/each}
	</div>
</section>
