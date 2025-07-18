<script lang="ts">
	import { onMount } from 'svelte';
	import {
		initializeMockData,
		getEmployees,
		getPerformanceEntries,
		getJobTitles,
		getTags,
		saveEmployees,
		savePerformanceEntries
	} from '$lib/utils/localStorage';
	import type { Employee, PerformanceEntry, JobTitle, Tag } from '$lib/types';
	import SummaryCard from '$lib/components/SummaryCard.svelte';

	let employees: Employee[] = $state([]);
	let performanceEntries: PerformanceEntry[] = $state([]);
	let jobTitles: JobTitle[] = $state([]);
	let tags: Tag[] = $state([]);
	let filteredEmployees: Employee[] = $state([]);
	let sortOption = $state(localStorage.getItem('sortOption') || 'recent');
	let filterJobTitle = $state(localStorage.getItem('filterJobTitle') || 'all');
	let search = $state('');

	onMount(() => {
		initializeMockData();
		employees = getEmployees();
		performanceEntries = getPerformanceEntries();
		jobTitles = getJobTitles();
		tags = getTags();
		applyFiltersAndSorting();
	});

	const activeEmployees = $derived(employees.filter((e) => !e.archived));
	const totalEntries = $derived(performanceEntries.length);
	const averageRating = $derived(
		totalEntries > 0
			? performanceEntries.reduce((acc, entry) => acc + entry.rating, 0) / totalEntries
			: 0
	);
	const notEvaluatedCount = $derived(
		activeEmployees.filter(
			(emp) => !performanceEntries.some((entry) => entry.employeeId === emp.id)
		).length
	);

	$effect(() => {
		localStorage.setItem('sortOption', sortOption);
		localStorage.setItem('filterJobTitle', filterJobTitle);
		applyFiltersAndSorting();
	});

	function applyFiltersAndSorting() {
		let tempEmployees = employees.filter((e) => !e.archived);

		if (filterJobTitle !== 'all') {
			tempEmployees = tempEmployees.filter((e) => e.jobTitle === filterJobTitle);
		}

		// Add this block to handle search
		if (search) {
			tempEmployees = tempEmployees.filter(
				(emp) =>
					(emp.firstName + ' ' + emp.lastName).toLowerCase().includes(search.toLowerCase()) ||
					(emp.nickname || '').toLowerCase().includes(search.toLowerCase())
			);
		}

		switch (sortOption) {
			case 'recent':
				tempEmployees.sort((a, b) => {
					const aLast = lastEntry(a.id);
					const bLast = lastEntry(b.id);
					if (!aLast) return 1;
					if (!bLast) return -1;
					return new Date(bLast.createdAt).getTime() - new Date(aLast.createdAt).getTime();
				});
				break;
			case 'least-recent':
				tempEmployees.sort((a, b) => {
					const aLast = lastEntry(a.id);
					const bLast = lastEntry(b.id);
					if (!aLast) return 1;
					if (!bLast) return -1;
					return new Date(aLast.createdAt).getTime() - new Date(bLast.createdAt).getTime();
				});
				break;
			case 'not-evaluated':
				tempEmployees = tempEmployees.filter((e) => !lastEntry(e.id));
				break;
			case 'highest-avg':
				tempEmployees.sort((a, b) => avgRating(b.id) - avgRating(a.id));
				break;
			case 'lowest-avg':
				tempEmployees.sort((a, b) => avgRating(a.id) - avgRating(b.id));
				break;
			case 'most-entries':
				tempEmployees.sort((a, b) => entriesCount(b.id) - entriesCount(a.id));
				break;
			case 'least-entries':
				tempEmployees.sort((a, b) => entriesCount(a.id) - entriesCount(b.id));
				break;
		}

		filteredEmployees = tempEmployees;
	}

	function lastEntry(employeeId: number): PerformanceEntry | undefined {
		const entries = performanceEntries.filter((e) => e.employeeId === employeeId);
		if (entries.length === 0) return undefined;
		return entries.sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)[0];
	}

	function avgRating(employeeId: number): number {
		const entries = performanceEntries.filter((e) => e.employeeId === employeeId);
		if (entries.length === 0) return 0;
		const sum = entries.reduce((acc, entry) => acc + entry.rating, 0);
		return sum / entries.length;
	}

	function entriesCount(employeeId: number): number {
		return performanceEntries.filter((e) => e.employeeId === employeeId).length;
	}

	function getRatingColor(rating: number): string {
		const colors = ['#FF0D0D', '#FF4E11', '#FF8E15', '#FAB733', '#ACB334', '#69B34C'];
		const index = Math.round(rating);
		return colors[index] || colors[0];
	}
</script>

<svelte:head>
	<title>EPT - Dashboard</title>
	<meta name="description" content="Employee Performance Tracker Dashboard" />
</svelte:head>

<section>
	<div class="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<SummaryCard title="Active Employees" value={activeEmployees.length} />
		<SummaryCard title="Entries Written" value={totalEntries} />
		<SummaryCard title="Average Rating" value={averageRating.toFixed(2)} />
		<SummaryCard title="Employees Not Evaluated" value={notEvaluatedCount} />
	</div>
	<div class="mb-8">
		<input
			type="text"
			id="search"
			bind:value={search}
			placeholder="Search for an employee..."
			class="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
	</div>
	<div class="flex flex-wrap items-center gap-4 mb-4">
		<div>
			<label for="sort" class="block text-sm font-medium text-gray-700">Sort by</label>
			<select
				id="sort"
				bind:value={sortOption}
				class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
			>
				<option value="recent">Most Recently Evaluated</option>
				<option value="least-recent">Least Recently Evaluated</option>
				<option value="not-evaluated">Not Yet Evaluated</option>
				<option value="highest-avg">Highest Ratings Avg</option>
				<option value="lowest-avg">Lowest Ratings Avg</option>
				<option value="most-entries">Most Evaluation Entries</option>
				<option value="least-entries">Least Evaluation Entries</option>
			</select>
		</div>
		<div>
			<label for="filter" class="block text-sm font-medium text-gray-700">Filter by Position</label>
			<select
				id="filter"
				bind:value={filterJobTitle}
				class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
			>
				<option value="all">All</option>
				{#each jobTitles as title}
					<option value={title.name}>{title.name}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredEmployees as employee}
			<a
				href="/employees/{employee.id}"
				class="p-4 bg-white rounded-lg shadow-md block relative hover:shadow-lg transition-shadow"
			>
				<div class="absolute top-2 right-2 flex space-x-1">
					<span class="text-xs font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full"
						>{entriesCount(employee.id)} evals</span
					>
					{#if entriesCount(employee.id) > 0}
						<span
							class="text-xs font-bold text-white px-1.5 py-0.5 rounded-full"
							style="background-color: {getRatingColor(avgRating(employee.id))};"
							>{avgRating(employee.id).toFixed(1)} avg</span
						>
					{/if}
				</div>
				<h3 class="font-bold text-lg">
					{employee.nickname || employee.firstName}
					{employee.lastName}
				</h3>
				<span
					class="px-2 py-1 text-xs font-semibold text-white rounded-full"
					style="background-color: {jobTitles.find((jt) => jt.name === employee.jobTitle)?.color ||
						'#cccccc'};"
				>
					{employee.jobTitle}
				</span>
			</a>
		{/each}
	</div>
</section>
