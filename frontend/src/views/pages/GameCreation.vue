<template>
	<q-page class="row items-center justify-center">
		<q-form action="/play/matching" method="get" @submit="onSubmit" class="dark q-pa-md shadow-box shadow-8 bg-white"
			autofocus>
			<div class="q-ma-md">
				<h3>{{ capitalize($t('game.creation.title')) }}</h3>
			</div>
			<q-select filled v-model="map" :options="mapOptions" :label="capitalize($t('game.creation.mapSelection'))" class="bg-blue-grey-1 q-ma-md" />

			<div class="row justify-center" style="margin-top: 2.2em">
				<div class="q-gutter-y-md">
					<q-btn-toggle
						v-model="opponentType"
						toggle-color="primary"
						class="bg-blue-grey-1"
						:options="
						[
							{ label: capitalize($t('game.creation.play.anyone')), value: 'any' },
							{ label: capitalize($t('game.creation.play.friend')), value: 'friend' },
						]"
					/>
				</div>
			</div>
			<q-select filled v-if="opponentType == 'friend'" v-model="opponent" :options="friendList"
				:label="capitalize($t('game.creation.opponent'))" class="bg-blue-grey-1 q-ma-md" />
			<div class="q-ma-md">
				<q-btn :label="$t('game.creation.play.button')" class="full-width" type="submit" color="primary" />
			</div>
		</q-form>
	</q-page>
</template>

<script lang="ts">
import { inject, ref } from 'vue';
import { Capitalize } from 'src/boot/libs';

export default {
	setup ()
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		const map = ref('Any');
		const mapOptions = [
			'Any',
			'Normal',
			'Legacy',
			'Harder',
			'Doom'
		];
		const opponentType = ref('any');
		const friendList = [
			'Joe',
			'Jack',
			'Jane',
			'Keanu Reeves',
			'Reanu Keeves',
			'Bongo'
		];
		const opponent = ref(friendList[0]);
		return {
			friendList,
			map,
			mapOptions,
			opponent,
			opponentType,
			onSubmit ()
			{
				let newUri = '/play/matching';
				if (map.value !== 'Any')
					newUri += '?map=' + map.value;
				if (opponentType.value !== 'any')
				{
					newUri += (map.value !== 'Any') ? '&' : '?';
					newUri += 'opponent=' + opponent.value;
				}
				window.location.href = newUri;
			},
			capitalize
		};
	}
};
</script>
