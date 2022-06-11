<template>
	<q-page class="row items-center justify-center">
		<q-form action="/api/game" method="post" @submit="onSubmit" class="dark q-pa-md shadow-box shadow-8" autofocus>
			<div class="q-ma-md">
				<h3>Game creation</h3>
			</div>
			<q-select filled v-model="map" :options="mapOptions" label="Map selection" class="bg-blue-grey-1 q-ma-md" />
			<q-img :src="mapPreview" alt="A preview of the map" spinner-color="white" class="bg-blue-grey-1 q-ma-md"
				style="height: 200px; max-width: 300px" />
			<q-btn-toggle v-model="opponentType" toggle-color="primary" class="bg-blue-grey-1 q-ma-md" :options="[
				{ label: 'Play with anyone', value: 'any' },
				{ label: 'Play with a friend', value: 'friend' },
			]" />
			<q-select filled v-if="opponentType == 'friend'" v-model="opponent" :options="friendList"
				label="Opponent selection" class="bg-blue-grey-1 q-ma-md" />
			<div class="q-ma-md">
				<q-btn label="Play!" class="full-width" type="submit" color="primary" />
			</div>
		</q-form>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
	setup() {
		const map = ref('Any');
		const mapOptions = [
			'Any',
			'Normal',
			'Legacy',
			'Harder',
			'Doom'
		];
		const opponentType = ref('any');
		const opponent = ref('');
		const friendList = [
			'Joe',
			'Jack',
			'Jane',
			'Keanu Reeves',
			'Reanu Keeves',
			'Bongo'
		];
		const mapPreview = ref('https://placeimg.com/500/300/nature');
		return {
			friendList,
			map,
			mapOptions,
			opponent,
			opponentType,
			mapPreview,
			onSubmit() {
				console.log(map);
			}
		};
	}
};
</script>
