<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let employees = $derived(data.employees || []);
	let positions = $derived(data.positions || []);
	let search = $state('');

	let formState = $state({
		id: null as string | null,
		first_name: '',
		last_name: '',
		nickname: '',
		position: ''
	});

	function handleReset() {
		formState.id = null;
		formState.first_name = '';
		formState.last_name = '';
		formState.nickname = '';
		formState.position = '';
	}

	function startEditing(employee: (typeof employees)[0]) {
		formState.id = employee.id;
		formState.first_name = employee.first_name ?? '';
		formState.last_name = employee.last_name ?? '';
		formState.nickname = employee.nickname ?? '';
		formState.position = employee.position ?? '';
	}

	$effect(() => {
		if (filteredEmployees && typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	});

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
			<h2 class="text-xl font-semibold text-gray-700 mb-2">
				{#if formState.id}Edit Employee{:else}Add New Employee{/if}
			</h2>
			<form
				method="POST"
				action={formState.id ? `?/updateEmployee&id=${formState.id}` : '?/createEmployee'}
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
						bind:value={formState.first_name}
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Last Name</span>
					<input
						type="text"
						name="last_name"
						bind:value={formState.last_name}
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Nickname (Optional)</span>
					<input
						type="text"
						name="nickname"
						bind:value={formState.nickname}
						class="w-full p-2 border rounded"
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Position</span>
					<select
						name="position"
						bind:value={formState.position}
						class="w-full p-2 border rounded"
						required
					>
						<option value="" disabled>Select a position</option>
						{#each positions as position (position.id)}
							<option value={position.title}>{position.title}</option>
						{/each}
					</select>
				</label>
				<div class="flex items-center space-x-2">
					<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						{#if formState.id}Save Changes{:else}Add Employee{/if}
					</button>
					{#if formState.id}
						<button
							type="button"
							onclick={handleReset}
							class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
						>
							Cancel
						</button>
					{/if}
				</div>
				{#if form?.error}
					<p class="text-red-500">{form.error}</p>
				{/if}
			</form>
		</div>
		<div>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-gray-700">Employees</h2>
				<input
					type="text"
					bind:value={search}
					placeholder="Search employees..."
					class="w-1/2 p-2 border rounded"
				/>
			</div>
			{#if filteredEmployees.length}
				<ul class="space-y-2">
					{#each filteredEmployees as employee (employee.id)}
						<li
							class="p-4 rounded-lg shadow flex justify-between items-center"
							style:border-left="4px solid {(employee.position &&
								positionColorMap[employee.position]) ||
								'#cccccc'}"
						>
							<a href="/employees/{employee.id}" class="flex-grow">
								<div>
									<p class="font-bold">
										{employee.nickname || employee.first_name}
										{employee.last_name}
									</p>
									<p class="text-sm text-gray-600">{employee.position}</p>
								</div>
							</a>
							<div class="flex space-x-3">
								<button
									onclick={() => startEditing(employee)}
									class="text-gray-500 hover:text-blue-600"
									aria-label="Edit employee"
								>
									<i data-lucide="pencil" class="w-4 h-4"></i>
								</button>
								<form
									class="items-center flex"
									method="POST"
									action="?/archiveEmployee&id={employee.id}"
									use:enhance={({ cancel }) => {
										if (!confirm('Are you sure you want to archive this employee?')) {
											cancel();
										}
										return async ({ update }) => {
											await update({ reset: false });
										};
									}}
								>
									<button
										type="submit"
										class="text-gray-500 hover:text-yellow-600"
										aria-label="Archive employee"
									>
										<i data-lucide="archive" class="w-4 h-4"></i>
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No active employees found.</p>
			{/if}
		</div>
	</div>
</div>
