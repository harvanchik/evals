<script lang="ts">
	import type { PageProps } from './$types';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import type { EmployeeWithStats } from '$lib/types';
	import { ArrowUp, ArrowDown } from 'lucide-svelte';

	let { data }: PageProps = $props();

	let stats = $derived(data.stats);
	let employees = $derived((data.employees as unknown as EmployeeWithStats[]) || []);
	let positions = $derived(data.positions || []);
	let search = $state('');

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

	function setSort(key: SortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	function sortAndFilter(items: EmployeeWithStats[], sk: SortKey, sd: SortDirection, st: string) {
		const searchTerm = st.toLowerCase();
		const filtered = items.filter(
			(emp) =>
				`${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().includes(searchTerm) ||
				(emp.nickname?.toString() || '').toLowerCase().includes(searchTerm)
		);

		return filtered.sort((a, b) => {
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
</script>

<svelte:head>
	<title>EPT - Dashboard</title>
	<meta name="description" content="Employee Performance Tracker Dashboard" />
</svelte:head>

<section class="space-y-6 md:space-y-8">
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
		<SummaryCard title="Entries Written" value={stats.totalEntries} />
		<SummaryCard title="Employees Reviewed" value={stats.totalEmployeesReviewed} />
		<SummaryCard title="Average Rating" value={(stats.avgRating || 0).toFixed(2)} />
		<SummaryCard title="Not Evaluated" value={stats.totalEmployeesNotEvaluated} />
	</div>

	{#if stats.entriesPerUser && Object.keys(stats.entriesPerUser).length > 0}
		<div class="bg-white p-4 rounded-md shadow">
			<h2 class="text-lg font-bold text-gray-800 mb-2">Entries per User</h2>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
				{#each Object.entries(stats.entriesPerUser) as [user, count]}
					<div class="flex justify-between bg-gray-50 p-2 rounded">
						<span class="font-medium text-gray-700">{user}</span>
						<span class="text-gray-900 font-bold">{count}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="space-y-4">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-grow">
				<input
					type="text"
					bind:value={search}
					placeholder="Search employees..."
					class="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			<div class="flex items-center justify-start md:justify-end gap-2 flex-wrap">
				<span class="text-sm font-medium text-gray-600 hidden md:block">Sort by:</span>
				<button
					onclick={() => setSort('name')}
					class="px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1"
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
					class="px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1"
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
					class="px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1"
					class:bg-blue-600={sortKey === 'totalEntries'}
					class:text-white={sortKey === 'totalEntries'}
					class:bg-gray-200={sortKey !== 'totalEntries'}
					class:text-gray-700={sortKey !== 'totalEntries'}
				>
					Total Entries
					{#if sortKey === 'totalEntries'}
						{#if sortDirection === 'asc'}
							<ArrowUp class="w-4 h-4" />
						{:else}
							<ArrowDown class="w-4 h-4" />
						{/if}
					{/if}
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each sortAndFilter(employees, sortKey, sortDirection, search) as employee (employee.id)}
				<a
					href="/employees/{employee.id}"
					class="block p-4 bg-white rounded-md shadow hover:bg-gray-50 transition-all"
					style:border-left="4px solid {(employee.position &&
						positionColorMap[employee.position]) ||
						'#cccccc'}"
				>
					<div class="flex justify-between items-start">
						<div>
							<div class="font-bold text-gray-800">
								{employee.first_name}
								{employee.last_name}
							</div>
							<div class="text-sm text-gray-600">{employee.position}</div>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-sm text-gray-800 font-semibold">
								{(employee.avgRating || 0).toFixed(2)} ★
							</div>
							<div class="text-xs text-gray-500">{employee.totalEntries} entries</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
