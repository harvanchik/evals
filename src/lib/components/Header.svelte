<script lang="ts">
	import { page } from '$app/stores';
	import { LogOut, User, LayoutDashboard, Users, Briefcase, Tags } from 'lucide-svelte';
	import type { UsersRecord } from '../../xata';

	let { user }: { user: UsersRecord | null } = $props();
	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/employees', label: 'Employees' },
		{ href: '/positions', label: 'Positions' },
		{ href: '/tags', label: 'Tags' }
	];
</script>

<header class="bg-white shadow-md md:shadow-none md:border-b md:border-gray-200">
	<div class="container mx-auto px-4 pt-[calc(env(safe-area-inset-top)-1.5rem)]">
		<div class="flex items-center justify-between h-16">
			<!-- Desktop Header -->
			<div class="hidden md:flex items-center justify-between w-full">
				<div class="flex items-center space-x-2">
					<img src="/favicon.png" alt="EPT Logo" class="h-9 w-9" />
				</div>
				<div class="flex items-center space-x-2">
					<nav class="flex items-center space-x-2">
						{#each navLinks as link}
							<a
								href={link.href}
								class="px-3 py-2 rounded-md text-sm font-medium"
								class:text-blue-600={$page.url.pathname === link.href}
								class:bg-blue-50={$page.url.pathname === link.href}
								class:text-gray-600={$page.url.pathname !== link.href}
								class:hover:bg-gray-100={$page.url.pathname !== link.href}
							>
								{link.label}
							</a>
						{/each}
					</nav>
					{#if user}
						<div class="flex items-center space-x-4">
							<div class="w-px h-6 bg-gray-300"></div>
							<div class="flex items-center space-x-2">
								<div class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
									<User class="text-gray-500 scale-80" />
								</div>
								<span class="text-sm font-medium text-gray-700">{user.username}</span>
							</div>
							<a href="/logout" class="text-gray-500 hover:text-red-600 w-full scale-80">
								<LogOut />
							</a>
						</div>
					{/if}
				</div>
			</div>

			<!-- START: Mobile Header -->
			<div class="md:hidden flex items-center justify-between w-full">
				<div class="flex items-center space-x-2">
					<img src="/favicon.png" alt="EPT Logo" class="h-9 w-9" />
				</div>
				{#if user}
					<div class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
							<User class="text-gray-500" />
						</div>
						<span class="text-sm font-medium text-gray-700">{user.username}</span>
					</div>
				{/if}
			</div>
			<!-- END: Mobile Header -->
		</div>
	</div>
</header>

<!-- Mobile Bottom Navbar -->
<nav
	class="md:hidden fixed bottom-0 inset-x-0 bg-gray-100 text-gray-800 border-t border-gray-200 z-50 pb-[calc(env(safe-area-inset-bottom)-1.5rem)]"
>
	<div class="flex justify-around items-center h-18">
		<a
			href="/"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Dashboard"
		>
			<LayoutDashboard class="w-5 h-5" />
			<span class="text-xs mt-1">Dashboard</span>
		</a>
		<a
			href="/employees"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Employees"
		>
			<Users class="w-5 h-5" />
			<span class="text-xs mt-1">Employees</span>
		</a>
		<a
			href="/positions"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Positions"
		>
			<Briefcase class="w-5 h-5" />
			<span class="text-xs mt-1">Positions</span>
		</a>
		<a
			href="/tags"
			class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
			aria-label="Tags"
		>
			<Tags class="w-5 h-5" />
			<span class="text-xs mt-1">Tags</span>
		</a>
		{#if user}
			<form action="/logout" method="POST" class="flex flex-col items-center">
				<button
					type="submit"
					class="flex flex-col items-center text-center hover:bg-gray-200 p-2 rounded-lg text-sm"
					aria-label="Logout"
				>
					<LogOut class="w-5 h-5" />
					<span class="text-xs mt-1">Logout</span>
				</button>
			</form>
		{/if}
	</div>
</nav>
