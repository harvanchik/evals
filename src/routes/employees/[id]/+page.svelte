<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		getEmployees,
		getPerformanceEntries,
		savePerformanceEntries,
		saveEmployees,
		getJobTitles,
		getTags
	} from '$lib/utils/localStorage';
	import type { Employee, PerformanceEntry, JobTitle, Tag } from '$lib/types';
	import { page } from '$app/state';

	let employee: Employee | undefined = $state(undefined);
	let performanceEntries: PerformanceEntry[] = $state([]);
	let jobTitles: JobTitle[] = $state([]);
	let allTags: Tag[] = $state([]);
	let description = $state('');
	let rating = $state(0);
	let selectedTagIds = $state<number[]>([]);
	let error = $state('');
	let success = $state('');
	let editingEntry: PerformanceEntry | null = $state(null);
	let expandedHistory: { [key: number]: boolean } = $state({});

	onMount(() => {
		const employeeId = parseInt(page.url.pathname.split('/').pop() || '', 10);
		const employees = getEmployees();
		employee = employees.find((e: Employee) => e.id === employeeId);
		if (employee) {
			const allEntries = getPerformanceEntries();
			performanceEntries = allEntries.filter(
				(entry: PerformanceEntry) => entry.employeeId === employeeId
			);
		}
		jobTitles = getJobTitles();
		allTags = getTags();
	});

	const jobTitleColor = $derived(
		jobTitles.find((jt) => jt.name === employee?.jobTitle)?.color || '#cccccc'
	);

	const avgRating = $derived(
		performanceEntries.length > 0
			? performanceEntries.reduce((acc, entry) => acc + entry.rating, 0) / performanceEntries.length
			: 0
	);

	function formatTimestamp(isoString: string) {
		const date = new Date(isoString);
		return date.toLocaleString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});
	}

	function toggleTag(tagId: number) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
		} else {
			selectedTagIds.push(tagId);
		}
	}

	function addEntry(event: Event) {
		event.preventDefault();
		if (!description || rating < 0 || rating > 5) {
			error = 'Please provide a valid description and rating (0-5).';
			success = '';
			return;
		}

		if (employee) {
			const newEntry: PerformanceEntry = {
				id: Date.now(),
				employeeId: employee.id,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				description,
				rating,
				tagIds: selectedTagIds
			};
			const allEntries = getPerformanceEntries();
			allEntries.push(newEntry);
			savePerformanceEntries(allEntries);
			performanceEntries.push(newEntry);
			success = 'Performance entry added successfully!';
			description = '';
			rating = 0;
			selectedTagIds = [];
			error = '';
		}
	}

	function startEditing(entry: PerformanceEntry) {
		editingEntry = { ...entry, tagIds: [...(entry.tagIds || [])] };
	}

	function cancelEditing() {
		editingEntry = null;
	}

	function updateEntry(event: Event) {
		event.preventDefault();
		if (editingEntry) {
			const allEntries = getPerformanceEntries();
			const index = allEntries.findIndex((e) => e.id === editingEntry!.id);
			if (index !== -1) {
				const originalEntry = allEntries[index];

				const tagsChanged =
					JSON.stringify(originalEntry.tagIds?.sort()) !==
					JSON.stringify(editingEntry.tagIds?.sort());

				if (
					originalEntry.description === editingEntry.description &&
					originalEntry.rating === editingEntry.rating &&
					!tagsChanged
				) {
					editingEntry = null;
					return;
				}

				const updatedEntry: PerformanceEntry = {
					...editingEntry,
					updatedAt: new Date().toISOString(),
					history: [
						...(originalEntry.history || []),
						{
							description: originalEntry.description,
							rating: originalEntry.rating,
							tagIds: originalEntry.tagIds,
							updatedAt: originalEntry.updatedAt
						}
					]
				};
				allEntries[index] = updatedEntry;
				savePerformanceEntries(allEntries);
				performanceEntries = performanceEntries.map((e) =>
					e.id === updatedEntry.id ? updatedEntry : e
				);
				editingEntry = null;
			}
		}
	}

	function deleteEntry(entryId: number) {
		if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
			const allEntries = getPerformanceEntries();
			const updatedEntries = allEntries.filter((e) => e.id !== entryId);
			savePerformanceEntries(updatedEntries);
			performanceEntries = performanceEntries.filter((e) => e.id !== entryId);
			success = 'Performance entry deleted successfully!';
			error = '';
		}
	}

	function toggleHistory(entryId: number) {
		expandedHistory[entryId] = !expandedHistory[entryId];
	}

	function archiveEmployee() {
		if (employee) {
			const employees = getEmployees();
			const index = employees.findIndex((e: Employee) => e.id === employee!.id);
			if (index !== -1) {
				employees[index].archived = true;
				saveEmployees(employees);
				goto('/employees');
			}
		}
	}
</script>

{#if employee}
	<div class="p-4">
		<button onclick={() => history.back()} class="text-blue-500 hover:underline mb-4 inline-block">
			&larr; Back
		</button>
		<h1 class="text-2xl font-bold text-gray-800">
			{employee.nickname || employee.firstName}
			{employee.lastName}
			{#if employee.nickname}
				<span class="text-lg text-gray-500">({employee.firstName} {employee.lastName})</span>
			{/if}
		</h1>
		<span
			class="px-2 py-1 text-xs font-semibold text-white rounded-full"
			style="background-color: {jobTitleColor};"
		>
			{employee.jobTitle}
		</span>
		<a
			href="/employees/{employee.id}/edit"
			class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4 inline-block"
			>Edit Employee</a
		>

		<button
			onclick={archiveEmployee}
			class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4 ml-2 inline-block"
			>Archive Employee</button
		>

		<div class="mt-8">
			<h2 class="text-xl font-bold text-gray-800">Performance Entries</h2>
			<div class="flex space-x-4 text-sm text-gray-600 mb-4">
				<span>Total Entries: {performanceEntries.length}</span>
				{#if performanceEntries.length > 0}
					<span>Average Rating: {avgRating.toFixed(1)}/5</span>
				{/if}
			</div>
			<ul class="space-y-4 mt-4">
				{#each performanceEntries as entry}
					<li class="p-4 bg-gray-50 rounded-md">
						{#if editingEntry && editingEntry.id === entry.id}
							<form onsubmit={updateEntry} class="space-y-4">
								<label class="block">
									<span class="text-gray-700">Description</span>
									<textarea
										bind:value={editingEntry.description}
										class="w-full p-2 border rounded"
										required
									></textarea>
								</label>
								<label class="block">
									<span class="text-gray-700">Rating (0-5)</span>
									<input
										type="number"
										bind:value={editingEntry.rating}
										min="0"
										max="5"
										class="w-full p-2 border rounded"
										required
									/>
								</label>
								<label class="block">
									<span class="text-gray-700">Tags</span>
									<div class="flex flex-wrap gap-2 mt-2">
										{#each allTags as tag}
											<button
												type="button"
												onclick={() => {
													if (editingEntry!.tagIds!.includes(tag.id)) {
														editingEntry!.tagIds = editingEntry!.tagIds!.filter(
															(id) => id !== tag.id
														);
													} else {
														editingEntry!.tagIds!.push(tag.id);
													}
												}}
												class="px-3 py-1 text-sm rounded-full {editingEntry!.tagIds!.includes(
													tag.id
												)
													? 'bg-blue-500 text-white'
													: 'bg-gray-200 text-gray-800'}"
											>
												{tag.name}
											</button>
										{/each}
									</div>
								</label>
								<button
									type="submit"
									class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button
								>
								<button
									type="button"
									onclick={cancelEditing}
									class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
									>Cancel</button
								>
							</form>
						{:else}
							<div class="flex space-x-2 mb-2">
								{#each entry.tagIds || [] as tagId}
									<span
										class="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full"
									>
										{allTags.find((t) => t.id === tagId)?.name}
									</span>
								{/each}
							</div>
							<p class="text-gray-800">{entry.description}</p>
							<div class="flex justify-between items-center mt-2">
								<div class="text-sm text-gray-500">
									<div>Created: {formatTimestamp(entry.createdAt)}</div>
									{#if entry.createdAt !== entry.updatedAt}
										<div>Updated: {formatTimestamp(entry.updatedAt)}</div>
									{/if}
								</div>
								<span class="font-bold text-blue-500">Rating: {entry.rating}/5</span>
							</div>
							<div class="mt-2">
								<button
									onclick={() => startEditing(entry)}
									class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
									>Edit</button
								>
								<button
									onclick={() => deleteEntry(entry.id)}
									class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs ml-2"
									>Delete</button
								>
								{#if entry.history && entry.history.length > 0}
									<button
										onclick={() => toggleHistory(entry.id)}
										class="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs ml-2"
										>View History</button
									>
								{/if}
							</div>
							{#if expandedHistory[entry.id]}
								<div class="mt-4 p-2 bg-gray-100 rounded">
									<h4 class="font-bold text-sm">History</h4>
									<ul class="space-y-2 mt-2">
										{#each entry.history!.slice().reverse() as pastEntry, i}
											<li class="p-2 bg-white rounded shadow-sm">
												<div class="flex space-x-2 mb-2">
													{#each pastEntry.tagIds || [] as tagId}
														<span
															class="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full"
														>
															{allTags.find((t) => t.id === tagId)?.name}
														</span>
													{/each}
												</div>
												<p class="text-gray-800">{pastEntry.description}</p>
												<div class="flex justify-between items-center mt-2">
													<span class="text-xs text-gray-500"
														>Updated: {formatTimestamp(pastEntry.updatedAt)}</span
													>
													<span class="font-bold text-blue-500 text-xs"
														>Rating: {pastEntry.rating}/5</span
													>
												</div>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<div class="mt-8 p-4 bg-gray-50 rounded-md">
			<h2 class="text-lg font-semibold text-gray-800">Add Performance Entry</h2>
			{#if error}
				<p class="text-red-600">{error}</p>
			{/if}
			{#if success}
				<p class="text-green-600">{success}</p>
			{/if}
			<form onsubmit={addEntry} class="space-y-4">
				<label class="block">
					<span class="text-gray-700">Description</span>
					<textarea bind:value={description} class="w-full p-2 border rounded" required></textarea>
				</label>
				<label class="block">
					<span class="text-gray-700">Rating (0-5)</span>
					<input
						type="number"
						bind:value={rating}
						min="0"
						max="5"
						class="w-full p-2 border rounded"
						required
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Tags</span>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each allTags as tag}
							<button
								type="button"
								onclick={() => toggleTag(tag.id)}
								class="px-3 py-1 text-sm rounded-full {selectedTagIds.includes(tag.id)
									? 'bg-blue-500 text-white'
									: 'bg-gray-200 text-gray-800'}"
							>
								{tag.name}
							</button>
						{/each}
					</div>
				</label>
				<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>Add Entry</button
				>
			</form>
		</div>
	</div>
{:else}
	<p>Employee not found.</p>
{/if}
