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
			<div class="text-h6">
				<span v-if="game.map != 'any'">On map {{ game.map }}</span>
				<span v-else>on any map</span>
			</div>
			<q-btn v-if="game.status == 'awaiting-player'" label="Join game" class="q-mt-sm" icon="sports_mma" color="primary" />
			<q-btn v-else-if="game.status == 'playing'" label=" " class="q-mt-sm" icon="visibility" color="primary">
				Watch game ({{ game.spectators }} watching)
			</q-btn>
			<q-btn v-else label="Game ended" class="q-mt-sm" icon="cancel" disable color="primary" />
			<q-field class="link-to-game q-mt-sm" v-if="game.status != 'done'" outlined label="Link to game" stack-label>
				<template v-slot:control>
					<div class="self-center full-width no-outline" tabindex="0">http://localhost:3000/game/{{ game.room }}</div>
				</template>

				<template v-slot:after>
					<q-btn round dense flat @click="createUrlAndCopyToClipboard(game.room)" icon="content_copy" />
				</template>
			</q-field>
		</q-card-section>
    </q-card>
</template>

<script lang="ts">
// import { ref } from 'vue';

function copyTextToClipboard (text: string)
{
	if (!navigator.clipboard)
	{
		console.error('Could not copy to clipboard');
		return;
	}
	navigator.clipboard.writeText(text).then(function ()
	{
		console.log('Async: Copying to clipboard was successful!');
	}, function (err)
	{
		console.error('Async: Could not copy text: ', err);
	});
}

function createUrlAndCopyToClipboard (text: string)
{
	const url: string = "http://localhost:3000/game/" + text;
	copyTextToClipboard(url);
}

export default ({
	setup ()
	{
		const gameList = [
			{
				room: 'jvowmfk',
				map: 'forest',
				status: 'playing',
				spectators: 3,
				players: ['Buom_01', 'Cbertran'],
				avatars: [null, null],
				scores: [3, 2]
			},
			{
				room: 'testRoom2',
				map: 'basic',
				status: 'done',
				spectators: 0,
				players: ['Rekt76', 'Fdec'],
				avatars: [null, null],
				scores: [3, 5]
			},
			{
				room: 'testRoom1',
				map: 'any',
				status: 'awaiting-player',
				spectators: 0,
				players: ['pohl', ''],
				avatars: [null, null],
				scores: [0, 0]
			}
		];
		return {
			createUrlAndCopyToClipboard,
			gameList
		};
	}
});
</script>

<style lang="scss">

.link-to-game {
	max-width: 400px;
	margin-left: auto;
	margin-right: auto;
}

</style>
