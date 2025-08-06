<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let username = $state(data.user.username);
	let first_name = $state(data.user.first_name);
	let last_name = $state(data.user.last_name);

	let oldPassword = $state('');
	let newPassword = $state('');
	let repeatPassword = $state('');

	let profileSuccessMessage = $state<string | undefined>();
	let profileErrorMessage = $state<string | undefined>();
	let passwordSuccessMessage = $state<string | undefined>();
	let passwordErrorMessage = $state<string | undefined>();
	let profileLoading = $state(false);
	let passwordLoading = $state(false);

	$effect(() => {
		username = data.user.username;
		first_name = data.user.first_name;
		last_name = data.user.last_name;
	});

	$effect(() => {
		if (form?.formId === 'updateProfile') {
			profileSuccessMessage = form?.success;
			profileErrorMessage = form?.error;
		} else if (form?.formId === 'changePassword') {
			passwordSuccessMessage = form?.success;
			passwordErrorMessage = form?.error;
		}
	});

	$effect(() => {
		if (profileSuccessMessage || profileErrorMessage) {
			const timer = setTimeout(() => {
				profileSuccessMessage = undefined;
				profileErrorMessage = undefined;
			}, 3000);
			return () => clearTimeout(timer);
		}
	});

	$effect(() => {
		if (passwordSuccessMessage || passwordErrorMessage) {
			const timer = setTimeout(() => {
				passwordSuccessMessage = undefined;
				passwordErrorMessage = undefined;
			}, 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
	<div class="bg-white p-6 rounded-lg shadow-md">
		<h1 class="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">User Profile</h1>
		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				profileLoading = true;
				return async ({ update }) => {
					await update({ reset: false });
					profileLoading = false;
				};
			}}
		>
			<div class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label
					>
					<input
						type="text"
						id="username"
						name="username"
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						bind:value={username}
						required
						disabled={profileLoading}
					/>
				</div>
				<div>
					<label for="first_name" class="block text-sm font-medium text-gray-700 mb-1"
						>First Name</label
					>
					<input
						type="text"
						id="first_name"
						name="first_name"
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						bind:value={first_name}
						disabled={profileLoading}
					/>
				</div>
				<div>
					<label for="last_name" class="block text-sm font-medium text-gray-700 mb-1"
						>Last Name</label
					>
					<input
						type="text"
						id="last_name"
						name="last_name"
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						bind:value={last_name}
						disabled={profileLoading}
					/>
				</div>
			</div>
			<div class="mt-6 flex justify-end">
				<button
					type="submit"
					class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10 w-20 flex justify-center items-center"
					disabled={profileLoading}
				>
					{#if profileLoading}
						<Spinner />
					{:else}
						Save
					{/if}
				</button>
			</div>
		</form>
		{#if profileSuccessMessage}
			<div class="mt-4 text-green-600 bg-green-100 border border-green-400 p-3 rounded-md">
				{profileSuccessMessage}
			</div>
		{/if}
		{#if profileErrorMessage}
			<div class="mt-4 text-red-600 bg-red-100 border border-red-400 p-3 rounded-md">
				{profileErrorMessage}
			</div>
		{/if}
	</div>

	<div class="bg-white p-6 rounded-lg shadow-md mt-6">
		<h2 class="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">
			{#if data.user.password}
				Change or Remove Password
			{:else}
				Create Password
			{/if}
		</h2>

		<form
			method="POST"
			action="?/changePassword"
			use:enhance={() => {
				passwordLoading = true;
				return async ({ update, result }) => {
					await update({ reset: false });
					if (result.type === 'success') {
						oldPassword = '';
						newPassword = '';
						repeatPassword = '';
					}
					passwordLoading = false;
				};
			}}
		>
			<div class="space-y-4">
				{#if data.user.password}
					<div>
						<label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-1"
							>Old Password</label
						>
						<input
							type="password"
							id="oldPassword"
							name="oldPassword"
							class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							bind:value={oldPassword}
							required
							disabled={passwordLoading}
						/>
					</div>
				{/if}
				<div>
					<label
						for="newPassword"
						class="block text-sm font-medium text-gray-700 mb-1"
						class:text-gray-500={data.user.password}
					>
						New Password
						{#if data.user.password}
							(optional)
						{/if}
					</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						bind:value={newPassword}
						required={!data.user.password}
						disabled={passwordLoading}
					/>
				</div>
				<div>
					<label
						for="repeatPassword"
						class="block text-sm font-medium text-gray-700 mb-1"
						class:text-gray-500={data.user.password}
					>
						Repeat New Password
						{#if data.user.password}
							(optional)
						{/if}
					</label>
					<input
						type="password"
						id="repeatPassword"
						name="repeatPassword"
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						bind:value={repeatPassword}
						required={!data.user.password}
						disabled={passwordLoading}
					/>
				</div>
			</div>
			<div class="mt-6 flex justify-end">
				<button
					type="submit"
					class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10 w-40 flex justify-center items-center"
					disabled={passwordLoading}
				>
					{#if passwordLoading}
						<Spinner />
					{:else if data.user.password}
						Update Password
					{:else}
						Create Password
					{/if}
				</button>
			</div>
		</form>
		{#if passwordSuccessMessage}
			<div class="mt-4 text-green-600 bg-green-100 border border-green-400 p-3 rounded-md">
				{passwordSuccessMessage}
			</div>
		{/if}
		{#if passwordErrorMessage}
			<div class="mt-4 text-red-600 bg-red-100 border border-red-400 p-3 rounded-md">
				{passwordErrorMessage}
			</div>
		{/if}
	</div>
</div>
