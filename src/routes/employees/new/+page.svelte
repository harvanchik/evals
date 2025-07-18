<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();
	let positions = $derived(data.positions || []);
</script>

<svelte:head>
	<title>New Employee</title>
</svelte:head>

<div class="p-4">
	<h1 class="text-2xl font-bold text-gray-800">Create New Employee</h1>

	<form method="POST" use:enhance class="space-y-4 mt-4">
		<label class="block">
			<span class="text-gray-700">First Name</span>
			<input type="text" name="first_name" class="w-full p-2 border rounded" required />
		</label>
		<label class="block">
			<span class="text-gray-700">Last Name</span>
			<input type="text" name="last_name" class="w-full p-2 border rounded" required />
		</label>
		<label class="block">
			<span class="text-gray-700">Nickname (Optional)</span>
			<input type="text" name="nickname" class="w-full p-2 border rounded" />
		</label>
		<label class="block">
			<span class="text-gray-700">Position</span>
			<select name="position" class="w-full p-2 border rounded" required>
				<option value="" disabled selected>Select a position</option>
				{#each positions as position (position.id)}
					<option value={position.title}>{position.title}</option>
				{/each}
			</select>
		</label>

		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>Create Employee</button
		>

		{#if form?.error}
			<p class="text-red-500">{form.error}</p>
		{/if}
		{#if form?.success}
			<p class="text-green-500">Employee created successfully!</p>
		{/if}
	</form>
</div>
