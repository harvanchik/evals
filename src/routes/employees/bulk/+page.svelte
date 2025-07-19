<script lang="ts">
	import { getJobTitles, getEmployees, saveEmployees } from '$lib/utils/localStorage';
	import type { JobTitle, Employee } from '$lib/types';
	import { onMount } from 'svelte';

	let csvData = $state('');
	let jobTitles: JobTitle[] = $state([]);
	let feedback = $state<{ success: string[]; errors: string[] }>({ success: [], errors: [] });

	onMount(() => {
		jobTitles = getJobTitles();
	});

	function handleImport(event: Event) {
		event.preventDefault();
		feedback = { success: [], errors: [] };

		const employees = getEmployees();
		const existingJobTitles = jobTitles.map((jt) => jt.name.toLowerCase());
		let maxId = employees.reduce((max, e) => (e.id > max ? e.id : max), 0);

		const rows = csvData.trim().split('\n');
		const newEmployees: Employee[] = [];
		const localErrors: string[] = [];

		rows.forEach((row, index) => {
			const [firstName, lastName, nickname, jobTitle] = row.split(',').map((item) => item.trim());

			if (!firstName || !lastName || !jobTitle) {
				localErrors.push(
					`Row ${index + 1}: Missing required fields (firstName, lastName, jobTitle). Row data: "${row}"`
				);
				return;
			}

			if (!existingJobTitles.includes(jobTitle.toLowerCase())) {
				localErrors.push(
					`Row ${index + 1}: Job title "${jobTitle}" does not exist. Row data: "${row}"`
				);
				return;
			}

			maxId++;
			newEmployees.push({
				id: maxId,
				firstName,
				lastName,
				nickname: nickname || undefined,
				jobTitle,
				archived: false
			});
		});

		if (newEmployees.length > 0) {
			const updatedEmployees = [...employees, ...newEmployees];
			saveEmployees(updatedEmployees);
			feedback.success.push(`${newEmployees.length} employee(s) successfully imported.`);
		}

		feedback.errors = localErrors;
		if (localErrors.length === 0 && newEmployees.length > 0) {
			csvData = '';
		}
	}
</script>

<svelte:head>
	<title>Bulk Add Employees</title>
</svelte:head>

<div class="p-4">
	<a href="/employees" class="text-blue-500 hover:underline mb-4 inline-block"
		>&larr; Back to Employees</a
	>
	<h1 class="text-2xl font-bold text-gray-800 mb-4">Bulk Add Employees</h1>

	<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
		<p class="font-bold">Instructions</p>
		<p>Paste CSV data below. Each line should represent one employee.</p>
		<p>
			The format must be: <code class="bg-blue-200 p-1 rounded"
				>firstName,lastName,nickname,jobTitle</code
			>
		</p>
		<p>
			The <code class="bg-blue-200 p-1 rounded">nickname</code> is optional. The job title must already
			exist in the system.
		</p>
	</div>

	<form onsubmit={handleImport} class="space-y-4">
		<label class="block">
			<span class="text-gray-700">CSV Data</span>
			<textarea
				bind:value={csvData}
				class="w-full p-2 border rounded mt-1 h-64 font-mono"
				placeholder="John,Doe,Johnny,Developer..."
				required
			></textarea>
		</label>
		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Import Employees</button
		>
	</form>

	{#if feedback.success.length > 0 || feedback.errors.length > 0}
		<div class="mt-8">
			<h2 class="text-xl font-bold">Import Results</h2>
			{#if feedback.success.length > 0}
				<div class="mt-4 p-4 bg-green-100 text-green-700 rounded">
					{#each feedback.success as msg}
						<p>{msg}</p>
					{/each}
				</div>
			{/if}
			{#if feedback.errors.length > 0}
				<div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
					<p class="font-bold">The following rows had errors and were not imported:</p>
					<ul class="list-disc list-inside mt-2">
						{#each feedback.errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>
 