<script lang="ts">
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Create New Employee</title>
</svelte:head>

<div class="p-4">
	<h1 class="text-2xl font-bold mb-4">Create New Employee</h1>
	<form method="POST" class="space-y-4 max-w-lg">
		<div>
			<label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
			<input
				type="text"
				id="firstName"
				name="firstName"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
				required
			/>
		</div>
		<div>
			<label for="lastName" class="block text-sm font-medium text-gray-700"
				>Last Name (Optional)</label
			>
			<input
				type="text"
				id="lastName"
				name="lastName"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
			/>
		</div>
		<div>
			<label for="nickname" class="block text-sm font-medium text-gray-700"
				>Nickname (Optional)</label
			>
			<input
				type="text"
				id="nickname"
				name="nickname"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
			/>
		</div>
		<div>
			<label for="position" class="block text-sm font-medium text-gray-700">Position</label>
			<input
				type="text"
				id="position"
				name="position"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
				required
			/>
		</div>

		{#if form?.error}
			<p class="text-red-500 text-sm">{form.error}</p>
		{/if}

		<button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
			Create Employee
		</button>
	</form>
</div>
