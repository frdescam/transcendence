<template>
	<q-card class="overflow-hidden q-pa-md">
		<q-form
			@submit="createGame"
			class="q-gutter-md"
		>
			<q-input
				v-model="room"
				filled
				label="Room name"
				hint="The name of the party, which will be in the URL"
			/>

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
				hint="If selected, an invitation would be sent"
				:options="adversaryOptions"
				@filter="getFriendList"
			/>

			<div>
				<q-btn
					type="submit"
					label="Create the game"
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
import type { QSelect } from 'quasar';

interface selectOption
{
	label: string,
	value: string
}

const room = ref(null);
const map = ref(null);
const adversary = ref(null);

const mapOptions = Object.keys(maps).map(
	(mapKey) => ({
		label: maps[mapKey].name,
		value: mapKey
	}) as selectOption
);
const adversaryOptions = ref<selectOption[] | null>(null);

function getFriendList (inputValue: string, doneFn: (callbackFn: () => void, afterFn?: ((ref: QSelect) => void) | undefined) => void): void
{
	if (adversaryOptions.value !== null)
		doneFn();
	else
	{
		doneFn(() =>
		{
      // AXIOS
			adversaryOptions.value = [{ label: 'test', value: 'ok' }];
		});
	}
}

function createGame ()
{
	console.log({
		room: room.value,
		map: map.value?.value,
		adversary: adversary.value?.value
	});
}

export default defineComponent({
	name: 'GameCreation',
	components: {},
	setup ()
	{
		return {
			room,
			map,
			adversary,
			mapOptions,
			adversaryOptions,
			getFriendList,
			createGame
		};
	}
});
</script>
