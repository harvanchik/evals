<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let employees = $derived(data.employees || []);
	let positions = $derived(data.positions || []);
	let search = $state('');

	let newEmployee = $state({
		first_name: '',
		last_name: '',
		nickname: '',
		position: ''
	});

	function handleReset() {
		newEmployee.first_name = '';
		newEmployee.last_name = '';
		newEmployee.nickname = '';
		newEmployee.position = '';
	}

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

	let filteredEmployees = $derived(
		employees.filter(
			(emp) =>
				emp.archived !== true &&
				((emp.first_name + ' ' + emp.last_name).toLowerCase().includes(search.toLowerCase()) ||
					(emp.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
					(emp.position || '').toLowerCase().includes(search.toLowerCase()))
		)
	);
</script>

<svelte:head>
	<title>Employees</title>
</svelte:head>

<div class="p-4">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl font-bold text-gray-800">Employees</h1>
		<a href="/employees/archived" class="text-sm text-blue-500 hover:underline">View Archived</a>
	</div>

	<div class="grid md:grid-cols-2 gap-8 mt-4">
		<div>
			<h2 class="text-xl font-semibold text-gray-700 mb-2">Add New Employee</h2>
			<form
				method="POST"
				action="?/createEmployee"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							handleReset();
						}
						await update({ reset: false });
					};
				}}
				class="space-y-4 p-4 border rounded"
			>
				<label class="block">
					<span class="text-gray-700">First Name</span>
					<input
						type="text"
						name="first_name"
						bind:value={newEmployee.first_name}
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Last Name</span>
					<input
						type="text"
						name="last_name"
						bind:value={newEmployee.last_name}
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Nickname (Optional)</span>
					<input
						type="text"
						name="nickname"
						bind:value={newEmployee.nickname}
						class="w-full p-2 border rounded"
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Position</span>
					<select
						name="position"
						bind:value={newEmployee.position}
						class="w-full p-2 border rounded"
						required
					>
						<option value="" disabled>Select a position</option>
						{#each positions as position (position.id)}
							<option value={position.title}>{position.title}</option>
						{/each}
					</select>
				</label>
				<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>Add Employee</button
				>
				{#if form?.form === 'createEmployee' && form?.error}
					<p class="text-red-500">{form.error}</p>
				{/if}
			</form>
		</div>
		<div>
			<div class="mb-4">
				<input
					type="text"
					bind:value={search}
					placeholder="Search active employees..."
					class="w-full p-2 border rounded"
				/>
			</div>
			<h2 class="text-xl font-semibold text-gray-700 mb-2">Existing Employees</h2>
			{#if filteredEmployees.length}
				<ul class="space-y-2">
					{#each filteredEmployees as employee (employee.id)}
						<a href="/employees/{employee.id}" class="block">
							<li
								class="p-4 rounded-lg shadow flex justify-between items-center hover:bg-gray-50"
								style:border-left="4px solid {positionColorMap[employee.position] || '#cccccc'}"
							>
								<div>
									<p class="font-bold">
										{employee.nickname || employee.first_name}
										{employee.last_name}
									</p>
									<p class="text-sm text-gray-600">{employee.position}</p>
								</div>
							</li>
						</a>
					{/each}
				</ul>
			{:else}
				<p>No active employees found.</p>
			{/if}
		</div>
	</div>
</div>
