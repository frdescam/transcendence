<template>
	<q-card bordered class="my-card q-ma-md">
		<q-card-section>
			<div class="text-h6">
				<q-icon v-if="online" name="fiber_manual_record" color="green" />
				<q-icon v-else name="fiber_manual_record" color="red" />
				Profile status
			</div>
		</q-card-section>

		<q-separator />

		<q-card-section>
			<q-select v-model="paddleSelected" :options="paddleOptions" label="Standard" />
		</q-card-section>
    </q-card>

	<q-card bordered class="my-card q-ma-md">
		<q-card-section>
			<div class="text-h6">Paddle color</div>
		</q-card-section>

		<q-separator />

		<q-card-section>
			<q-select v-model="paddleSelected" :options="paddleOptions" label="Standard" />
		</q-card-section>
    </q-card>

	<q-card bordered class="my-card q-ma-md">
		<q-card-section>
			<div class="text-h6">Score</div>
		</q-card-section>

		<q-separator />

		<q-card-section>
			<div class="text-p">Wins: {{ wins }} / Losses: {{ losses }}</div>
			<div class="text-p">Ratio: {{ Math.round(wins / losses * 10) / 10 }}</div>
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
			online: ref(true),
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			],
			wins: ref(7),
			losses: ref(4)
		};
	}
});
</script>
