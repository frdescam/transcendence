<template>
	<q-card bordered class="my-card q-ma-md" v-for="game of gameList" v-bind:key="game">
		<q-card-section style="text-align: center">
			<div v-if="game.status == 'awaiting-player'">
				<div class="text-h6">{{ game.players[0] }} awaiting an opponent</div>
			</div>
			<div v-else>
				<div class="text-h6">{{ game.players[0] }} vs {{ game.players[1] }}</div>
				<div class="text-h6">{{ game.scores[0] }} - {{ game.scores[1] }}</div>
			</div>
			<p>
				<span v-if="game.room != ''">In room {{ game.room }}, </span>
				<span v-if="game.map != 'any'">on map {{ game.map }}</span>
				<span v-else>on any map</span>
			</p>
			<q-btn v-if="game.status == 'awaiting-player'" label="Join game" class="q-mt-sm" icon="sports_mma" color="primary" />
			<q-btn v-else label="Watch game" class="q-mt-sm" icon="visibility" color="primary" />
		</q-card-section>
    </q-card>
</template>

<script lang="ts">
// import { ref } from 'vue';

export default ({
	setup ()
	{
		const gameList = [
			{
				room: '',
				map: 'forest',
				status: 'playing',
				players: ['Buom_01', 'Cbertran'],
				avatars: [null, null],
				scores: [3, 2]
			},
			{
				room: 'testRoom1',
				map: 'any',
				status: 'awaiting-player',
				players: ['pohl', ''],
				avatars: [null, null],
				scores: [0, 0]
			}
		];
		return {
			gameList
		};
	}
});
</script>
