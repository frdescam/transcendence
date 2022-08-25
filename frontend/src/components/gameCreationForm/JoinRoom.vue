<template>
	<q-form @submit="onSubmit" class="q-pa-xs">
		<div class="q-ma-md">
			<h4>Join a room</h4>
		</div>
		<q-select filled v-model="map" :options="mapOptions" label="Map selection" class="bg-blue-grey-1" />
		<q-input v-model="opponent" label="Opponent id (optional)" />
		<div class="q-ma-md">
			<q-btn label="Join!" class="full-width" type="submit" color="primary" />
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
			'any',
			'classic',
			'forest',
			'synthwave'
		];
		const opponent = ref('');
		return {
			map,
			mapOptions,
			opponent,
			onSubmit ()
			{
				api.post('/party', {
					map: map.value,
					adversary: opponent.value
				}).then(res =>
				{
					console.log(res);
					router.push('/game/');
				});
			}
		};
	}
};
</script>
