<script lang="ts">
	import { Search } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { EmployeesRecord } from '../../xata';

	let { employees }: { employees: any[] } = $props();

	let searchTerm = $state('');
	let showDropdown = $state(false);
	let selectedIndex = $state(0);
	let searchInput: HTMLInputElement | undefined = $state();
	let dropdownContainer: HTMLDivElement | undefined = $state();

	// Filter employees based on search term
	let filteredEmployees = $derived.by(() => {
		if (!searchTerm.trim()) return [];

		const term = searchTerm.toLowerCase();
		return employees
			.filter((emp: any) => {
				// Exclude archived employees
				if (emp.archived) return false;

				const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
				const nickname = (emp.nickname || '').toLowerCase();
				return fullName.includes(term) || nickname.includes(term);
			})
			.slice(0, 10); // Limit to 10 results
	});

	// Show dropdown when there are results and search term exists
	$effect(() => {
		showDropdown = searchTerm.trim().length > 0 && filteredEmployees.length > 0;
		selectedIndex = 0; // Reset selection when results change
	});

	// Auto-scroll to keep selected item in view
	function scrollToSelectedItem() {
		if (!dropdownContainer) return;

		const selectedButton = dropdownContainer.querySelector(
			`[data-index="${selectedIndex}"]`
		) as HTMLElement;
		if (selectedButton) {
			selectedButton.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest'
			});
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showDropdown) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredEmployees.length - 1);
				scrollToSelectedItem();
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				scrollToSelectedItem();
				break;
			case 'Tab':
				event.preventDefault();
				// Tab cycles through the dropdown, wrapping around to the beginning
				if (event.shiftKey) {
					// Shift+Tab goes backwards
					selectedIndex = selectedIndex <= 0 ? filteredEmployees.length - 1 : selectedIndex - 1;
				} else {
					// Tab goes forwards
					selectedIndex = selectedIndex >= filteredEmployees.length - 1 ? 0 : selectedIndex + 1;
				}
				scrollToSelectedItem();
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredEmployees[selectedIndex]) {
					navigateToEmployee(filteredEmployees[selectedIndex]);
				}
				break;
			case 'Escape':
				searchTerm = '';
				showDropdown = false;
				searchInput?.blur();
				break;
		}
	}

	function navigateToEmployee(employee: any) {
		// Clear search state first
		searchTerm = '';
		showDropdown = false;
		searchInput?.blur();

		// Navigate to employee page
		goto(`/employees/${employee.id}`);
	}

	function handleClickOutside(event: MouseEvent) {
		const container = (event.target as Element)?.closest('.employee-search-container');
		if (!container) {
			showDropdown = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="employee-search-container relative">
	<div class="relative">
		<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
			<Search class="h-4 w-4 text-gray-400" />
		</div>
		<input
			bind:this={searchInput}
			bind:value={searchTerm}
			onfocus={() => (showDropdown = searchTerm.trim().length > 0 && filteredEmployees.length > 0)}
			onkeydown={handleKeydown}
			type="text"
			placeholder="Search employees..."
			class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
		/>
	</div>

	{#if showDropdown}
		<div
			bind:this={dropdownContainer}
			class="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-40 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
		>
			{#each filteredEmployees as employee, index (employee.id)}
				<button
					type="button"
					data-index={index}
					onclick={() => navigateToEmployee(employee)}
					class="w-full text-left relative py-2 pl-3 pr-9 hover:bg-gray-100 cursor-pointer"
					class:bg-blue-100={index === selectedIndex}
					class:text-blue-900={index === selectedIndex}
					class:text-gray-900={index !== selectedIndex}
				>
					<div class="flex items-center justify-between">
						<span class="font-medium">
							{employee.nickname || employee.first_name}
							{employee.last_name}
						</span>
						{#if employee.position}
							<span class="ml-2 text-gray-500 text-sm flex-shrink-0">{employee.position}</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
