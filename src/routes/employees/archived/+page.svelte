<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();

	let allEmployees = $derived(data.employees || []);
	let search = $state('');

	let archivedEmployees = $derived(
		allEmployees.filter(
			(emp) =>
				emp.archived === true &&
				((emp.first_name + ' ' + emp.last_name).toLowerCase().includes(search.toLowerCase()) ||
					(emp.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
					(emp.position || '').toLowerCase().includes(search.toLowerCase()))
		)
	);

	let positionColorMap = $derived(
		(data.positions || []).reduce(
			(acc, pos) => {
				if (pos.title) {
					acc[pos.title] = pos.color;
				}
				return acc;
			},
			{} as Record<string, string | null | undefined>
		)
	);

	$effect(() => {
		if (archivedEmployees && typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	});
</script>

<svelte:head>
	<title>Archived Employees</title>
</svelte:head>

<div class="p-4 max-w-4xl mx-auto">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl font-bold text-gray-800">Archived Employees</h1>
		<a href="/employees" class="text-sm text-blue-500 hover:underline">View Active</a>
	</div>

	<div class="mb-4">
		<input
			type="text"
			bind:value={search}
			placeholder="Search archived employees..."
			class="w-full p-2 border rounded"
		/>
	</div>

	{#if archivedEmployees.length}
		<ul class="space-y-2">
			{#each archivedEmployees as employee (employee.id)}
				<li
					class="p-4 rounded-lg shadow flex justify-between items-center"
					style:border-left="4px solid {(employee.position &&
						positionColorMap[employee.position]) ||
						'#cccccc'}"
				>
					<div class="flex-grow">
						<p class="font-bold">
							{employee.nickname || employee.first_name}
							{employee.last_name}
						</p>
						<p class="text-sm text-gray-600">{employee.position}</p>
					</div>
					<div class="flex items-center space-x-4">
						<a
							href="/employees/{employee.id}"
							class="text-gray-500 hover:text-blue-600"
							aria-label="View employee"
						>
							<i data-lucide="eye" class="w-5 h-5"></i>
						</a>
						<form
							class="items-center flex"
							method="POST"
							action="?/reinstateEmployee&id={employee.id}"
							use:enhance={() => {
								return async ({ update }) => {
									await update({ reset: false });
								};
							}}
						>
							<button
								type="submit"
								class="text-gray-500 hover:text-green-600 cursor-pointer"
								aria-label="Reinstate employee"
							>
								<i data-lucide="archive-restore" class="w-5 h-5"></i>
							</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No archived employees found.</p>
	{/if}
</div>
