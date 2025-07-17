<script lang="ts">
	let showMenu = $state(false);
</script>

<header class="bg-gray-100 text-gray-800 shadow-md">
	<nav class="container mx-auto px-4 py-2 flex justify-between items-center">
		<a href="/" class="text-xl font-bold">PerfTracker</a>
		<div class="hidden md:flex space-x-4">
			<a href="/" class="hover:underline">Home</a>
			<a href="/employees" class="hover:underline">Employees</a>
			<a href="/jobtitles" class="hover:underline">Job Titles</a>
		</div>
		<div class="md:hidden">
			<button onclick={() => (showMenu = !showMenu)} class="focus:outline-none">
				<svg
					class="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16m-7 6h7"
					></path>
				</svg>
			</button>
		</div>
	</nav>
	{#if showMenu}
		<div class="md:hidden">
			<a href="/" class="block py-2 px-4 text-sm hover:bg-gray-200">Home</a>
			<a href="/employees" class="block py-2 px-4 text-sm hover:bg-gray-200">Employees</a>
			<a href="/jobtitles" class="block py-2 px-4 text-sm hover:bg-gray-200">Job Titles</a>
		</div>
	{/if}
</header>
