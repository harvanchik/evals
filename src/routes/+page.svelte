<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeMockData, getEmployees } from '$lib/utils/localStorage';
	import type { Employee } from '$lib/types';

	let employees: Employee[] = [];

	onMount(() => {
		initializeMockData();
		employees = getEmployees();
	});
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
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each employees as employee}
				<div class="p-4 bg-gray-50 rounded-md shadow-sm">
					<h3 class="font-bold">{employee.name}</h3>
					<p class="text-gray-600">{employee.jobTitle}</p>
					<p class="text-gray-500 text-sm">{employee.department}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
