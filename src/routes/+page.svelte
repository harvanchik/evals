<script lang="ts">
	import { onMount } from 'svelte';
	import {
		initializeMockData,
		getEmployees,
		getPerformanceEntries,
		getJobTitles
	} from '$lib/utils/localStorage';
	import type { Employee, PerformanceEntry, JobTitle } from '$lib/types';

	let employees: Employee[] = $state([]);
	let performanceEntries: PerformanceEntry[] = $state([]);
	let jobTitles: JobTitle[] = $state([]);
	let filteredEmployees: Employee[] = $state([]);
	let sortOption = $state(localStorage.getItem('sortOption') || 'recent');
	let filterJobTitle = $state(localStorage.getItem('filterJobTitle') || 'all');
	let search = $state('');

	onMount(() => {
		initializeMockData();
		employees = getEmployees();
		performanceEntries = getPerformanceEntries();
		jobTitles = getJobTitles();
		applyFiltersAndSorting();
	});

	$effect(() => {
		localStorage.setItem('sortOption', sortOption);
		localStorage.setItem('filterJobTitle', filterJobTitle);
		applyFiltersAndSorting();
	});

	function applyFiltersAndSorting() {
		let tempEmployees = employees;

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
					return new Date(bLast.date).getTime() - new Date(aLast.date).getTime();
				});
				break;
			case 'least-recent':
				tempEmployees.sort((a, b) => {
					const aLast = lastEntry(a.id);
					const bLast = lastEntry(b.id);
					if (!aLast) return 1;
					if (!bLast) return -1;
					return new Date(aLast.date).getTime() - new Date(bLast.date).getTime();
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
		return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
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
	<title>Svelte Tailwind Template</title>
	<meta name="description" content="Svelte Tailwind Template" />
</svelte:head>

<section>
	<div class="text-center">
		<h1
			class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-fuchsia-400 to-violet-400 inline-block text-transparent bg-clip-text mb-4"
		>
			Employee Performance Tracker
		</h1>
		<p class="text-lg text-gray-600 mb-8">
			A simple tool to track employee performance and streamline evaluations.
		</p>
		<div class="flex justify-center space-x-4">
			<a
				href="/employees"
				class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
				>View Employees</a
			>
			<a
				href="/jobtitles"
				class="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
				>Manage Job Titles</a
			>
		</div>
	</div>

	<div class="mt-12">
		<h2 class="text-2xl font-bold text-gray-800 mb-4">Employee Overview</h2>
		<div class="flex space-x-4 mb-4">
			<div>
				<label for="search" class="block text-sm font-medium text-gray-700">Search</label>
				<input
					type="text"
					id="search"
					bind:value={search}
					class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
				/>
			</div>
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
				<label for="filter" class="block text-sm font-medium text-gray-700"
					>Filter by Position</label
				>
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
					class="p-4 bg-gray-50 rounded-md shadow-sm block relative"
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
					<h3 class="font-bold">{employee.nickname || employee.firstName} {employee.lastName}</h3>
					<span
						class="px-2 py-1 text-xs font-semibold text-white rounded-full"
						style="background-color: {jobTitles.find((jt) => jt.name === employee.jobTitle)
							?.color || '#cccccc'};"
					>
						{employee.jobTitle}
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>
