<template>
	<q-card bordered class="my-card q-ma-md">
		<q-card-section>
			<div class="text-h6">Paddle color</div>
		</q-card-section>

		<q-separator />

		<q-card-section>
			<q-select v-model="paddleSelected" :options="paddleOptions" label="Standard" />
		</q-card-section>
    </q-card>
</template>

<script lang="ts">
import { ref } from 'vue';

export default ({
	name: 'IndexPage',
	setup ()
	{
		return {
			paddleSelected: ref('Normal'),
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			]
		};
	}
});
</script>
