<script lang="ts">
export default {
	name: 'play-page'
};
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Socket } from 'socket.io-client';

import type { partyQuery as query } from 'src/components/game/common/logic/common'; // @TODO: Move common folder anywhere else

enum State
{
	Connecting,
	Querying,
	Awaiting,
	Found
}

const router = useRouter();
const route = useRoute();

const gameSocket: Socket = inject('socketGame') as Socket;
const status = ref(State.Connecting);
const map = computed(() => (route.query.map || null)); // @TODO: Manage change in the URL
const message = computed(() =>
{
	switch (status.value)
	{
	case State.Awaiting:
		return 'Awaiting such party to be created ...';

	case State.Querying:
		return 'Querying the server ...';

	case State.Found:
		return 'Redirecting to the party ...';

	default:
		return 'Connecting ...';
	}
});

function onFound (room: string)
{
	status.value = State.Found;
	router.push({
		path: `/game/${room}`,
		// name: 'party',
		params: {
			party: room
		}
	});
}

function onNotFound ()
{
	status.value = State.Awaiting;
}

function onDisconnect ()
{
	status.value = State.Connecting;
}

function onConnected ()
{
	status.value = State.Querying;
	gameSocket.emit(
		'game::query::find',
		{
			map: map.value
		} as query
	);
}

onMounted(() =>
{
	gameSocket.on('game::query::found', onFound);
	gameSocket.on('game::query::notFound', onNotFound);
	gameSocket.on('connect', onConnected);
	gameSocket.on('disconnect', onDisconnect);

	if (gameSocket.connected)
		onConnected();
});

onBeforeUnmount(() =>
{
	gameSocket.off('game::query::found', onFound);
	gameSocket.off('game::query::notFound', onNotFound);
	gameSocket.off('connect', onConnected);
	gameSocket.off('disconnect', onDisconnect);
	gameSocket.emit('game::query::leaveAll');
});

</script>

<template>
	<q-page class="page text-white text-center q-pa-md flex flex-center">
		<div class="container">
			<h1 class="text-h1">
				Looking for party{{map && (" with map " + map)}}...
			</h1>
			<p class="text-h2">{{message}}</p>
			<q-linear-progress
				rounded track-color="grey-7" color="white"
				:indeterminate="status != State.Connecting"
				:query="status == State.Connecting"
				/>
		</div>
	</q-page>
</template>

<style scoped lang="sass">
@keyframes colorfull
	0%
		background-color: $red-10
	8.33%
		background-color: $pink-10
	16.67%
		background-color: $purple-10
	25%
		background-color: $deep-purple-10
	33.33%
		background-color: $blue-10
	41.67%
		background-color: $light-blue-10
	50%
		background-color: $cyan-10
	58.33%
		background-color: $teal-10
	66.67%
		background-color: $green-10
	75%
		background-color: $lime-10
	83.33%
		background-color: $yellow-10
	91.67%
		background-color: $orange-10
	100%
		background-color: $red-10
.page
	animation: colorfull 60s linear infinite
.container
	min-width: 80vw
</style>
