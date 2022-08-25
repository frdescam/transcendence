<template>
	<q-form @submit="onSubmit" class="q-pa-xs">
		<div class="q-ma-md">
			<h4>Create a room</h4>
		</div>
		<q-input v-model="roomName" label="Room name" />
		<q-select filled v-model="map" :options="mapOptions" label="Map selection" class="bg-blue-grey-1" />
		<q-input v-model="opponent" label="Opponent id (optional)" />
		<div class="q-ma-md">
			<q-btn label="Create!" class="full-width" type="submit" color="primary" />
		</div>
	</q-form>
</template>

<script lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useRouter } from 'vue-router';

export default {
	setup ()
	{
		const router = useRouter();
		const map = ref('classic');
		const mapOptions = [
			'classic',
			'forest',
			'synthwave'
		];
		const opponent = ref('');
		const roomName = ref('');
		return {
			map,
			mapOptions,
			opponent,
			roomName,
			onSubmit ()
			{
				api.post('/party', {
					map: map.value,
					adversary: opponent.value,
					room: roomName.value
				}).then(res =>
				{
					console.log(res);
					router.push('/game/' + roomName.value);
				});
			}
		};
	}
};
</script>
