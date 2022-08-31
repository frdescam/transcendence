<template>
	<q-card class="overflow-hidden q-pa-md">
		<q-form
			@submit="createGame"
			class="q-gutter-md"
		>
			<q-select
				v-model="map"
				filled
				label="Map"
				hint="The map affect ball's speed and allowed controls"
				:options="mapOptions"
			/>

			<q-select
				v-model="adversary"
				filled
				label="Adversary"
				hint="if selected, Will enter on a queu to play with that person particularly"
				:options="[{label: 'A super test', value: 'test'}]"
			/>

			<div>
				<q-btn
					type="submit"
					label="Place a query"
					color="primary"
					class="full-width"
				/>
			</div>
		</q-form>
	</q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import maps from 'src/common/game/maps';

const room = ref(null);
const map = ref(null);
const adversary = ref(null);

const mapOptions = Object.keys(maps).map(
	(mapKey) => ({
		label: maps[mapKey].name,
		value: mapKey
	})
);

function queryMatch ()
{
	console.log('called');
}

export default defineComponent({
	name: 'GameMatching',
	components: {},
	setup ()
	{
		return {
			mapOptions,
			room,
			map,
			adversary,
			queryMatch
		};
	}
});
</script>
