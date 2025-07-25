<script lang="ts">
	import type { PageProps } from './$types';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import type { EmployeeWithStats } from '$lib/types';
	import { ArrowUp, ArrowDown } from 'lucide-svelte';
	import { darkenColor } from '$lib/utils/colors';

	let { data }: PageProps = $props();

	let stats = $derived(data.stats);
	let employees = $derived((data.employees as unknown as EmployeeWithStats[]) || []);
	let positions = $derived(data.positions || []);
	let search = $state('');
	let selectedPositions = $state<string[]>([]);
	let showPositionFilter = $state(false);

	$effect(() => {
		const savedSortKey = localStorage.getItem('dashboard_sortKey');
		if (savedSortKey) {
			sortKey = JSON.parse(savedSortKey);
		}
		const savedSortDirection = localStorage.getItem('dashboard_sortDirection');
		if (savedSortDirection) {
			sortDirection = JSON.parse(savedSortDirection);
		}
		const savedSelectedPositions = localStorage.getItem('dashboard_selectedPositions');
		if (savedSelectedPositions) {
			selectedPositions = JSON.parse(savedSelectedPositions);
		}
	});

	$effect(() => {
		localStorage.setItem('dashboard_sortKey', JSON.stringify(sortKey));
		localStorage.setItem('dashboard_sortDirection', JSON.stringify(sortDirection));
		localStorage.setItem('dashboard_selectedPositions', JSON.stringify(selectedPositions));
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
	<title>EPT - Dashboard</title>
	<meta name="description" content="Employee Performance Tracker Dashboard" />
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
			<div class="flex items-center justify-start md:justify-end gap-2 flex-wrap select-none">
				<span class="text-sm font-medium text-gray-600 hidden md:block">Sort by:</span>
				<button
					onclick={() => setSort('name')}
					class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center gap-1"
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
					class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center gap-1"
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
					class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center gap-1"
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
						class="px-2 py-1 text-[13px] font-medium rounded-md flex items-center text-center justify-around w-16"
						class:bg-blue-600={selectedPositions.length > 0}
						class:text-white={selectedPositions.length > 0}
						class:bg-gray-200={selectedPositions.length === 0}
						class:text-gray-700={selectedPositions.length === 0}
						class:justify-between={selectedPositions.length > 0}
					>
						<span>Pos</span>
						{#if selectedPositions.length > 0}
							<span
								class="bg-white text-blue-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
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
								<button onclick={selectAllPositions} class="text-sm text-blue-500 hover:underline">
									Select all
								</button>
								<button onclick={clearAllPositions} class="text-sm text-blue-500 hover:underline">
									Clear all
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each sortAndFilter(employees, sortKey, sortDirection, search, selectedPositions) as employee (employee.id)}
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
							<div
								class="text-sm font-semibold"
								style:color={getRatingColor(employee.avgRating || 0)}
							>
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
