<script lang="ts">
	let { title, value } = $props<{ title: string; value: number }>();
</script>

<div class="bg-white p-4 rounded-lg shadow-md text-center">
	<h2 class="text-xl font-semibold text-gray-600">{title}</h2>
	<p class="text-3xl font-bold text-gray-800">{value}</p>
</div>
