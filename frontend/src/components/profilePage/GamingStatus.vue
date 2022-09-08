<script setup lang="ts">
import { inject, onUnmounted, onBeforeUnmount, onMounted, reactive, readonly } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, copyToClipboard } from 'quasar';
import type { userId } from 'src/common/game/types';
import type { getPartyDto } from 'src/common/game/orm/getParty.dto';
import type { getUserPartyDto } from 'src/common/game/orm/getUserParty.dto';
import type { Socket } from 'socket.io-client';
import { useI18n } from 'vue-i18n';
import { Capitalize } from 'src/boot/libs';

const props = defineProps<{ userId: userId, title?: string, subscribe: boolean }>();

type usersArray = [userId | null, userId | null];
type stateType =
{
	connected: boolean,
	party: getPartyDto | null
};

const { t } = useI18n();
const capitalize: Capitalize = inject('capitalize') as Capitalize;

const router = useRouter();
const $q = useQuasar();
const gameSocket: Socket = inject('socketGame') as Socket;
const state = reactive<stateType>({ connected: false, party: null });

function onDisconnect (reason?: Socket.DisconnectReason)
{
	state.connected = false;
	if (props.subscribe)
	{
		gameSocket.emit('game::userinfos::leave', {
			id: props.userId
		});
	}
	if (typeof reason !== 'undefined' && reason === 'io server disconnect')
		gameSocket.connect();
}
function onConnected ()
{
	state.connected = true;
	if (props.subscribe)
	{
		gameSocket.emit('game::userinfos::join', {
			id: props.userId
		});
	}
}
function onUpdate (data: getUserPartyDto)
{
	if (data.userId !== props.userId)
		return;
	state.party = data.party;
}

onMounted(() =>
{
	gameSocket.on('game::userinfos', onUpdate);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.on('connect', onConnected);
	gameSocket.connect();

	if (gameSocket.connected)
		onConnected();
});

onUnmounted(() => gameSocket.disconnect());

onBeforeUnmount(() =>
{
	onDisconnect();
	gameSocket.off('game::userinfos', onUpdate);
	gameSocket.off('disconnect', onDisconnect);
	gameSocket.off('connect', onConnected);
});

const printStatus = (val: string) =>
{
	switch (val)
	{
	case 'awaiting-player':
		return capitalize(t('game.listView.message.awaiting'));
	case 'warmup':
		return capitalize(t('game.listView.message.warmup'));
	case 'paused':
		return capitalize(t('game.listView.message.paused'));
	case 'introducing-sleeve':
		return capitalize(t('game.listView.message.sleeve'));
	case 'running':
		return capitalize(t('game.listView.message.running'));
	case 'finish':
		return capitalize(t('game.listView.message.finish'));
	default:
		return capitalize(t('game.listView.message.default'));
	}
};

/* GUI utils */
function countPlayers (players: usersArray): number
{
	return (players.filter((userId: userId | null) => (!!userId)).length);
}

function routeFor (room: string)
{
	return (
		router.resolve({
			name: 'party',
			params: {
				party: room
			}
		}).href
	);
}

function roomUrlToClipboard (room: string, e: MouseEvent)
{
	e.stopPropagation();
	const link = location.protocol + '//' + location.host + routeFor(room);
	copyToClipboard(link)
		.catch(() =>
		{
			$q.notify({
				type: 'warning',
				message: capitalize(t('game.listView.failed'))
			});
		});
}
/* END GUI utils */

defineExpose({
	state: readonly(state)
});
</script>

<template>
	<q-card class="bg-white q-mb-md q-pb-sm">
		<q-card-section>
			<div class="text-h6">{{$props.title ?? capitalize($t('game.gameStatus.title'))}}</div>
			<div class="text-subtitle2 text-center" v-if="state.party">

				<span>
					<q-chip square :color="state.party.status == 'awaiting-player' ? 'orange' : 'green'">
						{{ countPlayers(state.party.players) + '/2' }}
					</q-chip>
					<q-tooltip>
						<q-avatar square>
							<img :src="state.party.avatars[0] ? state.party.avatars[0] : '/imgs/chat/default.webp'" v-if="state.party.players[0]">
						</q-avatar>
						vs
						<q-avatar square>
							<img :src="state.party.avatars[1] ? state.party.avatars[1] : '/imgs/chat/default.webp'" v-if="state.party.players[1]">
						</q-avatar>
					</q-tooltip>
				</span>

				{{ printStatus(state.party.status) }}

				<q-chip square :color="state.party.status == 'awaiting-player' ? 'grey' : 'blue'">
					{{ state.party.scores[0] }} - {{ state.party.scores[1] }}
				</q-chip>

			</div>
		</q-card-section>

		<q-separator inset />

		<q-card-section v-if="state.party">
				{{ capitalize($t('game.gameStatus.room')) }}
				<q-chip clickable icon-right="link" @click="(e) => {roomUrlToClipboard(state.party.room, e)}">
					{{ state.party.room }}
				</q-chip>
				<br/>
				{{ capitalize($t('game.gameStatus.map')) }} {{ state.party.map[0].toUpperCase() + state.party.map.substring(1) }}<br/>
				{{ capitalize($t('game.gameStatus.created')) }} {{((new Date(state.party.createdAt)).toLocaleString())}}<br/>
				{{ capitalize($t('game.gameStatus.scores')) }} {{ state.party.scores[0] }} - {{ state.party.scores[1] }}
		</q-card-section>

		<q-card-section v-if="!state.party">
			{{ capitalize($t('game.gameStatus.no')) }}
		</q-card-section>

		<q-separator v-if="state.party"/>

		<q-card-actions vertical v-if="state.party">
			<q-btn color="primary" flat :href="state.party && routeFor(state.party.room)" :disable="!state.party">
				{{ capitalize($t('game.gameStatus.spectate')) }}
			</q-btn>
		</q-card-actions>
	</q-card>
</template>

<style scoped>
</style>
