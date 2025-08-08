<script lang="ts">
	let {
		rating = $bindable(),
		maxRating = 5,
		color = 'gold',
		readOnly = false,
		size = 'w-6 h-6'
	} = $props();

	const starPath =
		'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z';

	let stars = $derived(
		Array.from({ length: maxRating }, (_, i) => {
			const starValue = i + 1;
			if (rating >= starValue) {
				return 'full';
			}
			if (rating >= starValue - 0.5) {
				return 'half';
			}
			return 'empty';
		})
	);

	function setRating(index: number, event: MouseEvent) {
		if (readOnly) return;
		const starElement = event.currentTarget as HTMLElement;
		const rect = starElement.getBoundingClientRect();
		const isHalf = (event.clientX - rect.left) / rect.width <= 0.5;
		rating = index + (isHalf ? 0.5 : 1);
	}

	function handleKeyDown(event: KeyboardEvent, index: number) {
		if (readOnly) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			rating = index + 1;
		}
	}
</script>

<div class="flex items-center space-x-2">
	{#if !readOnly}
		<span class="text-sm text-gray-600">Poor</span>
	{/if}
	<div class="flex space-x-0.5">
		{#each stars as type, i (i)}
			<div
				class:cursor-pointer={!readOnly}
				class:cursor-default={readOnly}
				onclick={(e) => setRating(i, e)}
				onkeydown={(e) => handleKeyDown(e, i)}
				role="radio"
				aria-checked={rating > i}
				aria-label={`Rate ${i + 1}`}
				tabindex={readOnly ? -1 : 0}
			>
				<svg class={size} viewBox="0 0 24 24">
					<defs>
						<clipPath id={`clip-${i}`}>
							<rect x="0" y="0" width="12" height="24" />
						</clipPath>
					</defs>
					{#if type === 'full'}
						<path d={starPath} fill={color} stroke={color} stroke-width="1.5" />
					{:else if type === 'empty'}
						<path d={starPath} fill="none" stroke={color} stroke-width="1.5" />
					{:else}
						<!-- half -->
						<path d={starPath} fill="none" stroke={color} stroke-width="1.5" />
						<path d={starPath} fill={color} clip-path={`url(#clip-${i})`} />
					{/if}
				</svg>
			</div>
		{/each}
	</div>
	{#if !readOnly}
		<span class="text-sm text-gray-600">Excellent</span>
		<span class="font-bold w-10 text-right">{rating.toFixed(1)}</span>
	{/if}
</div>
