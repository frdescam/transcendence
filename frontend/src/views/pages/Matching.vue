<script lang="ts">
export default {
	name: 'play-page'
};
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref, computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Notify } from 'quasar';
import type { Socket } from 'socket.io-client';
import { useI18n } from 'vue-i18n';

import type { partyQuery as query } from 'src/common/game/interfaces';

enum State
{
	Connecting,
	Querying,
	Awaiting,
	Found
}

const router = useRouter();
const route = useRoute();

const { t } = useI18n();
const gameSocket: Socket = inject('socketGame') as Socket;
const status = ref(State.Connecting);
const map = computed(() => (route.query.map || null));
const adversary = computed(() => (route.query.adversary || null));
const message = computed(() =>
{
	switch (status.value)
	{
	case State.Awaiting:
		return t('matching.messages.awaiting');
	case State.Querying:
		return t('matching.messages.querying');
	case State.Found:
		return t('matching.messages.found');
	default:
		return t('matching.messages.default');
	}
});

function onError (error: string)
{
	Notify.create({
		position: 'top',
		progress: true,
		timeout: 15000,
		message: error,
		type: 'negative',
		multiLine: true,
		actions: [
			{
				label: 'Dismiss',
				color: 'white'
			}
		]
	});
}

function onFound (room: string)
{
	status.value = State.Found;
	router.push({
		name: 'party',
		params: {
			party: room
		}
	});
}

function onNotFound ()
{
	status.value = State.Awaiting;
}

function onDisconnect (reason: Socket.DisconnectReason)
{
	status.value = State.Connecting;
	if (reason === 'io server disconnect')
		gameSocket.connect();
}

function onConnected ()
{
	status.value = State.Querying;
	gameSocket.emit(
		'game::query::find',
		{
			map: map.value ?? undefined,
			adversary: adversary.value ?? undefined
		} as query
	);
}

onMounted(() =>
{
	gameSocket.on('game::query::found', onFound);
	gameSocket.on('game::query::notFound', onNotFound);
	gameSocket.on('party::error', onError);
	gameSocket.on('connect', onConnected);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.connect();

	if (gameSocket.connected)
		onConnected();
});

onUnmounted(() => gameSocket.disconnect());

onBeforeUnmount(() =>
{
	gameSocket.off('game::query::found', onFound);
	gameSocket.off('game::query::notFound', onNotFound);
	gameSocket.off('party::error', onError);
	gameSocket.off('connect', onConnected);
	gameSocket.off('disconnect', onDisconnect);
	gameSocket.emit('game::query::leaveAll');
});

</script>

<template>
	<q-page class="text-white text-center q-pa-md flex flex-center">
		<div class="page-bg" />
		<div class="container">
			<h1 class="text-h1">
				{{ $t('matching.look') }} {{ (map) && $t('matching.with', { map: map }) }}
				{{ (adversary) && `, ${$t('matching.against')}` }}
			</h1>
			<p class="text-h2">{{ message }}</p>
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
.page-bg
	position: absolute
	height: 100%
	width: 100%
	animation: colorfull 60s linear infinite
	mix-blend-mode: hue
.container
	z-index: 20
	min-width: 80vw
</style>
