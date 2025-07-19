<script lang="ts">
	import type { UsersRecord } from '../../xata';

	let { user } = $props<{ user: UsersRecord }>();
</script>

<header class="bg-gray-100 text-gray-800 shadow-md">
	<nav class="container mx-auto px-4 py-2 flex justify-between items-center">
		<a href="/" class="text-xl font-bold">EPT</a>
		<div class="hidden md:flex space-x-4 items-center">
			<a href="/" class="hover:underline">Home</a>
			<a href="/employees" class="hover:underline">Employees</a>
			<a href="/positions" class="hover:underline">Positions</a>
			<a href="/tags" class="hover:underline">Tags</a>
			<form action="/logout" method="POST">
				<button type="submit" class="hover:underline">Logout</button>
			</form>
		</div>
	</nav>
</header>

<nav
	class="md:hidden fixed bottom-0 inset-x-0 bg-gray-100 text-gray-800 border-t border-gray-200 z-50"
>
	<div class="flex justify-around items-center h-16">
		<a href="/" class="text-center hover:bg-gray-200 p-2 rounded-lg text-sm">Home</a>
		<a href="/employees" class="text-center hover:bg-gray-200 p-2 rounded-lg text-sm">Employees</a>
		<a href="/jobtitles" class="text-center hover:bg-gray-200 p-2 rounded-lg text-sm">Job Titles</a>
		<a href="/tags" class="text-center hover:bg-gray-200 p-2 rounded-lg text-sm">Tags</a>
		<form action="/logout" method="POST">
			<button type="submit" class="text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
				>Logout</button
			>
		</form>
	</div>
</nav>
