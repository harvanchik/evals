<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import Spinner from '$lib/components/Spinner.svelte';
	import { Plus, Minus, ArrowUp, ArrowDown } from 'lucide-svelte';
	import type { EmployeeWithStats } from '$lib/types';

	let { data, form }: PageProps = $props();

	let employees = $state(data.employees as EmployeeWithStats[]);
	let positions = $derived(data.positions || []);
	let search = $state('');
	let loading = $state(false);
	let mobileFormVisible = $state(false);
	let selectedPositions = $state<string[]>([]);
	let showPositionFilter = $state(false);

	$effect(() => {
		const savedSortKey = localStorage.getItem('employees_sortKey');
		if (savedSortKey) {
			sortKey = JSON.parse(savedSortKey);
		}
		const savedSortDirection = localStorage.getItem('employees_sortDirection');
		if (savedSortDirection) {
			sortDirection = JSON.parse(savedSortDirection);
		}
		const savedSelectedPositions = localStorage.getItem('employees_selectedPositions');
		if (savedSelectedPositions) {
			selectedPositions = JSON.parse(savedSelectedPositions);
		}
	});

	$effect(() => {
		localStorage.setItem('employees_sortKey', JSON.stringify(sortKey));
		localStorage.setItem('employees_sortDirection', JSON.stringify(sortDirection));
		localStorage.setItem('employees_selectedPositions', JSON.stringify(selectedPositions));
	});

	type SortKey = 'name' | 'avgRating' | 'totalEntries';
	type SortDirection = 'asc' | 'desc';

	let sortKey: SortKey = $state('name');
	let sortDirection: SortDirection = $state('asc');

	let positionColorMap = $derived(
		(positions || []).reduce(
			(acc, pos) => {
				if (pos.title && typeof pos.color === 'string') {
					acc[pos.title] = pos.color;
				}
				return acc;
			},
			{} as Record<string, string | null | undefined>
		)
	);

	function togglePosition(positionTitle: string | undefined | null) {
		if (!positionTitle) return;
		const index = selectedPositions.indexOf(positionTitle);
		if (index > -1) {
			selectedPositions.splice(index, 1);
		} else {
			selectedPositions.push(positionTitle);
		}
		selectedPositions = selectedPositions;
	}

	function selectAllPositions() {
		selectedPositions = positions.map((p) => p.title).filter(Boolean) as string[];
	}

	function clearAllPositions() {
		selectedPositions = [];
	}

	function handleClickOutside(event: MouseEvent) {
		const menu = document.querySelector('.filter-menu');
		if (menu && !menu.contains(event.target as Node)) {
			showPositionFilter = false;
		}
	}

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
		mobileFormVisible = false;
	}

	function startEditing(employee: (typeof employees)[0]) {
		formState.id = employee.id;
		formState.first_name = employee.first_name ?? '';
		formState.last_name = employee.last_name ?? '';
		formState.nickname = employee.nickname ?? '';
		formState.position = employee.position ?? '';
		mobileFormVisible = true;
	}

	$effect(() => {
		if (typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	});

	function setSort(key: SortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	function sortAndFilter(
		items: EmployeeWithStats[],
		sk: SortKey,
		sd: SortDirection,
		st: string,
		sps: string[]
	) {
		const searchTerm = st.toLowerCase();
		const filteredBySearch = items.filter(
			(emp) =>
				`${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().includes(searchTerm) ||
				(emp.nickname?.toString() || '').toLowerCase().includes(searchTerm)
		);

		const filteredByPosition =
			sps.length === 0
				? filteredBySearch
				: filteredBySearch.filter((emp) => emp.position && sps.includes(emp.position));

		return filteredByPosition.sort((a, b) => {
			let compare = 0;
			switch (sk) {
				case 'name': {
					const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
					const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
					compare = nameA.localeCompare(nameB);
					break;
				}
				case 'avgRating':
					compare = (a.avgRating || 0) - (b.avgRating || 0);
					break;
				case 'totalEntries':
					compare = (a.totalEntries || 0) - (b.totalEntries || 0);
					break;
			}
			return sd === 'asc' ? compare : -compare;
		});
	}

	function getRatingColor(rating: number) {
		const colors = [
			'#ff0d0d',
			'#ff2e0f',
			'#ff4e11',
			'#ff6e13',
			'#ff8e15',
			'#fda324',
			'#fab733',
			'#d3b534',
			'#acb334',
			'#8BB340',
			'#69b34c'
		];
		if (rating < 0) rating = 0;
		if (rating > 5) rating = 5;
		const index = Math.min(Math.round(rating * 2), colors.length - 1);
		return colors[index];
	}
</script>

<svelte:head>
	<title>Employees</title>
</svelte:head>

{#if showPositionFilter}
	<div
		class="fixed inset-0 z-10"
		role="button"
		tabindex="0"
		onclick={handleClickOutside}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				showPositionFilter = false;
			}
		}}
	></div>
{/if}

<div>
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl font-bold text-gray-800">Employees</h1>
		<a href="/employees/archived" class="text-sm text-blue-500 hover:underline">View Archived</a>
	</div>

	<div class="grid md:grid-cols-2 gap-8 mt-4">
		<div>
			<div
				class="flex items-center mb-2 cursor-pointer md:cursor-auto"
				onclick={() => (mobileFormVisible = !mobileFormVisible)}
				onkeypress={() => (mobileFormVisible = !mobileFormVisible)}
				role="button"
				tabindex="0"
			>
				<h2 class="text-xl font-semibold text-gray-700">
					{#if formState.id}Edit Employee{:else}Add New Employee{/if}
				</h2>
				<span class="md:hidden ml-2">
					{#if mobileFormVisible || formState.id}
						<Minus />
					{:else}
						<Plus />
					{/if}
				</span>
			</div>
			<form
				method="POST"
				action={formState.id ? `?/updateEmployee&id=${formState.id}` : '?/createEmployee'}
				use:enhance={() => {
					loading = true;

					return async ({ update, result }) => {
						await update({ reset: false });
						if (result.type === 'success' && result.data?.newEmployee) {
							const newEmployee = result.data.newEmployee as EmployeeWithStats;
							employees.unshift(newEmployee);
							employees = employees;
							handleReset();
						}
						loading = false;
					};
				}}
				class:hidden={!mobileFormVisible && !formState.id}
				class="md:block space-y-4 p-4 border rounded"
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
				<div class="flex items-center justify-between space-x-2">
					<button
						type="submit"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-36 h-10 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
						disabled={loading}
					>
						{#if loading}
							<Spinner />
						{:else if formState.id}
							Save Changes
						{:else}
							Add Employee
						{/if}
					</button>
					{#if !formState.id}
						<a href="/employees/bulk" class="text-blue-500 hover:underline ml-4">Bulk Add</a>
					{/if}
					{#if formState.id}
						<button
							type="button"
							onclick={handleReset}
							class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
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
			</div>
			<div class="flex flex-col gap-4 mb-4">
				<div class="flex-grow">
					<input
						type="text"
						bind:value={search}
						placeholder="Search employees..."
						class="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div class="flex items-center justify-start gap-2 flex-wrap select-none">
					<span class="text-sm font-medium text-gray-600 hidden md:block">Sort by:</span>
					<button
						onclick={() => setSort('name')}
						class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center gap-1 cursor-pointer"
						class:bg-blue-600={sortKey === 'name'}
						class:text-white={sortKey === 'name'}
						class:bg-gray-200={sortKey !== 'name'}
						class:text-gray-700={sortKey !== 'name'}
					>
						Name
						{#if sortKey === 'name'}
							{#if sortDirection === 'asc'}
								<ArrowUp class="w-4 h-4" />
							{:else}
								<ArrowDown class="w-4 h-4" />
							{/if}
						{/if}
					</button>
					<button
						onclick={() => setSort('avgRating')}
						class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center gap-1 cursor-pointer"
						class:bg-blue-600={sortKey === 'avgRating'}
						class:text-white={sortKey === 'avgRating'}
						class:bg-gray-200={sortKey !== 'avgRating'}
						class:text-gray-700={sortKey !== 'avgRating'}
					>
						Avg. Rating
						{#if sortKey === 'avgRating'}
							{#if sortDirection === 'asc'}
								<ArrowUp class="w-4 h-4" />
							{:else}
								<ArrowDown class="w-4 h-4" />
							{/if}
						{/if}
					</button>
					<button
						onclick={() => setSort('totalEntries')}
						class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center gap-1 cursor-pointer"
						class:bg-blue-600={sortKey === 'totalEntries'}
						class:text-white={sortKey === 'totalEntries'}
						class:bg-gray-200={sortKey !== 'totalEntries'}
						class:text-gray-700={sortKey !== 'totalEntries'}
					>
						No. Entries
						{#if sortKey === 'totalEntries'}
							{#if sortDirection === 'asc'}
								<ArrowUp class="w-4 h-4" />
							{:else}
								<ArrowDown class="w-4 h-4" />
							{/if}
						{/if}
					</button>
					<div class="relative filter-menu">
						<button
							onclick={() => (showPositionFilter = !showPositionFilter)}
							class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center text-center justify-around w-15 cursor-pointer"
							class:bg-blue-600={selectedPositions.length > 0}
							class:text-white={selectedPositions.length > 0}
							class:bg-gray-200={selectedPositions.length === 0}
							class:text-gray-700={selectedPositions.length === 0}
							class:justify-between={selectedPositions.length > 0}
						>
							<span>Pos</span>
							{#if selectedPositions.length > 0}
								<span
									class="bg-white text-blue-600 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
									>{selectedPositions.length}</span
								>
							{/if}
						</button>
						{#if showPositionFilter}
							<div
								class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20"
								role="presentation"
								onclick={(e) => e.stopPropagation()}
								onkeydown={() => {}}
							>
								<div class="py-1">
									{#each positions as position}
										{#if position.title}
											<label
												class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
											>
												<input
													type="checkbox"
													class="form-checkbox h-4 w-4 text-blue-600"
													checked={selectedPositions.includes(position.title)}
													onchange={() => togglePosition(position.title)}
												/>
												<span class="ml-3 flex items-center gap-2">
													<span
														class="h-4 w-4 rounded-full"
														style:background-color={typeof position.color === 'string'
															? position.color
															: '#cccccc'}
													></span>
													{position.title}
												</span>
											</label>
										{/if}
									{/each}
								</div>
								<div class="border-t border-gray-200 px-4 py-2 flex justify-between">
									<button
										onclick={selectAllPositions}
										class="text-sm text-blue-500 hover:underline cursor-pointer"
									>
										Select all
									</button>
									<button
										onclick={clearAllPositions}
										class="text-sm text-blue-500 hover:underline cursor-pointer"
									>
										Clear all
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
			{#if sortAndFilter(employees, sortKey, sortDirection, search, selectedPositions).length}
				<ul class="space-y-2">
					{#each sortAndFilter(employees, sortKey, sortDirection, search, selectedPositions) as employee (employee.id)}
						<li
							class="p-4 rounded-lg shadow flex justify-between items-center"
							style:border-left="4px solid {(employee.position &&
								positionColorMap[employee.position]) ||
								'#cccccc'}"
						>
							<a href="/employees/{employee.id}" class="flex-grow">
								<div>
									<p class="font-bold flex items-center gap-1">
										{employee.nickname || employee.first_name}
										{employee.last_name}
										{#if employee?.totalEntries > 0}
											<span
												class="ml-0.5 font-semibold text-sm"
												style:color={getRatingColor(employee?.avgRating || 0)}
											>
												{employee?.avgRating?.toFixed(1)}★
											</span>
										{/if}
										<span class="text-gray-500 font-normal text-xs">({employee?.totalEntries})</span
										>
									</p>
									<p class="text-sm text-gray-600">{employee.position}</p>
								</div>
							</a>
							<div class="flex items-center space-x-3">
								<button
									onclick={() => startEditing(employee)}
									class="text-gray-500 hover:text-blue-600 cursor-pointer"
									aria-label="Edit employee"
								>
									<i data-lucide="pencil" class="w-5 h-5"></i>
								</button>
								<form
									class="items-center flex"
									method="POST"
									action="?/archiveEmployee&id={employee.id}"
									use:enhance={({ cancel, formElement }) => {
										if (!confirm('Are you sure you want to archive this employee?')) {
											cancel();
											return;
										}

										const url = new URL(formElement.action);
										const id = url.searchParams.get('id');
										if (id) {
											const index = employees.findIndex((e) => e.id === id);
											if (index > -1) {
												employees.splice(index, 1);
												employees = employees;
											}
										}

										loading = true;
										return async ({ update }) => {
											await update({ reset: false });
											loading = false;
										};
									}}
								>
									<button
										type="submit"
										class="text-gray-500 hover:text-yellow-600 cursor-pointer disabled:cursor-not-allowed"
										aria-label="Archive employee"
										disabled={loading}
									>
										<i data-lucide="archive" class="w-5 h-5"></i>
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
