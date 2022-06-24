<template>
	<q-page class="row items-center justify-center">
		<h1>Cool stuff</h1>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
	setup ()
	{
		const inputRef = ref(null);
		return {
			inputRef
		};
	}
};
</script>
