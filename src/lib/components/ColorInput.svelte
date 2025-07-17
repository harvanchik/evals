<script lang="ts">
	let { value = $bindable() } = $props<{ value: string }>();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let sanitized = target.value.replace(/[^0-9a-fA-F]/g, '');
		if (sanitized.length > 6) {
			sanitized = sanitized.slice(0, 6);
		}
		value = `#${sanitized}`;
	}
</script>

<div class="flex">
	<input
		type="color"
		bind:value
		class="p-1 h-10 w-10 block bg-white border border-gray-300 cursor-pointer rounded-l-md"
	/>
	<div class="relative w-full">
		<span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">#</span>
		<input
			type="text"
			value={value.substring(1)}
			oninput={handleInput}
			class="w-full p-2 pl-7 border-t border-b border-r rounded-r-md"
			maxlength="6"
		/>
	</div>
</div>
