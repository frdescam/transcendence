<script setup lang="ts">
import clsx from 'clsx';
import { onBeforeUnmount, onMounted, onUnmounted, reactive, readonly, inject } from 'vue';
import { Socket } from 'socket.io-client';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Capitalize } from 'src/boot/libs';
import { useQuasar, copyToClipboard } from 'quasar';
import type { getPartyDto } from 'src/common/game/orm/getParty.dto';
import type { userId } from 'src/common/game/types';

type usersArray = [userId | null, userId | null];
type partyListObject = {[key: string]: getPartyDto};
interface column
{
	name: string,
	required?: boolean,
	label: string,
	field: string,
	sortable?: boolean,
	align?: 'left' | 'center' | 'right',
	sort?: ((a: unknown, b: unknown, rowA: unknown, rowB: unknown) => number)
}

const { t } = useI18n();
const capitalize: Capitalize = inject('capitalize') as Capitalize;
const gameSocket: Socket = inject('socketGame') as Socket;

const $q = useQuasar();
const router = useRouter();
const state = reactive<{ connected: boolean }>({ connected: false });
const partiesListObject = reactive<partyListObject>({});

const tablePagination = {
	sortBy: 'createdAt',
	rowsPerPage: 50
};

const tablePaginationPerPage = [20, 50, 100, 0];

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

function joinRoom (room: string)
{
	router.push(routeFor(room));
}

function roomUrlToClipboard (room: string, e: Event)
{
	e.stopPropagation();

	const link = location.protocol + '//' + location.host + routeFor(room);
	copyToClipboard(link)
		.then(() =>
		{
			$q.notify({
				type: 'positive',
				message: capitalize(t('game.listView.copied'))
			});
		})
		.catch(() =>
		{
			$q.notify({
				type: 'warning',
				message: capitalize(t('game.listView.failed'))
			});
		});
}

function countPlayers (players: usersArray): number
{
	return (players.filter((userId: userId | null) => (!!userId)).length);
}

function onDisconnect (reason: Socket.DisconnectReason)
{
	state.connected = false;
	if (reason === 'io server disconnect')
		gameSocket.connect();
}

function onConnected ()
{
	gameSocket.emit('game::list::start');
}

function onCompleteList (list: getPartyDto[])
{
	state.connected = true;
	const batchObject: partyListObject = {};

	Object.keys(partiesListObject).forEach((key) =>
	{
		if (!(key in batchObject))
			delete partiesListObject[key];
	});

	list.forEach((party) =>
	{
		batchObject[party.room] = party;
	});
	Object.assign(partiesListObject, batchObject);
}

function onUpdate (party: getPartyDto)
{
	partiesListObject[party.room] = party;
}

onMounted(() =>
{
	gameSocket.on('game::list::full', onCompleteList);
	gameSocket.on('game::list::update', onUpdate);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.on('connect', onConnected);
	gameSocket.connect();

	if (gameSocket.connected)
		onConnected();
});

onUnmounted(() => gameSocket.disconnect());

onBeforeUnmount(() =>
{
	gameSocket.emit('game::list::stop');
	gameSocket.off('game::list::full', onCompleteList);
	gameSocket.off('game::list::update', onUpdate);
	gameSocket.off('disconnect', onDisconnect);
	gameSocket.off('connect', onConnected);
});

defineExpose({
	partiesListObject: readonly(partiesListObject)
});
</script>

<template>
	<q-table
		row-key="room"
		color="primary"
		dense
		:rows="Object.keys(partiesListObject).map((key)=>(partiesListObject[key]))"
		:columns="[
      {
        name: 'room',
        required: true,
        label: $t('game.listView.columns.room').toUpperCase(),
        field: 'room',
        sortable: true,
        align: 'left'
      },
      {
        name: 'map',
        label: $t('game.listView.columns.map').toUpperCase(),
        field: 'map',
        sortable: true,
        align: 'left'
      },
      {
        name: 'scores',
        label: $t('game.listView.columns.scores').toUpperCase(),
        field: 'scores',
        align: 'center'
      },
      {
        name: 'players',
        label: $t('game.listView.columns.players').toUpperCase(),
        field: 'players',
        sortable: true,
        sort: (a: usersArray, b: usersArray) => (
          (countPlayers(b)) - (countPlayers(a))
        ),
        align: 'center'
      },
      {
        name: 'status',
        label: $t('game.listView.columns.status').toUpperCase(),
        field: 'status',
        align: 'center'
      },
      {
        name: 'createdAt',
        label: $t('game.listView.columns.creation').toUpperCase(),
        field: 'createdAt',
        sortable: true,
        sort: (a: string, b: string) => (
          (new Date(b).getTime()) - (new Date(a).getTime())
        ),
        align: 'right'
      }
    ] as column[]"
		:loading="!state.connected"
		:pagination="tablePagination"
		:rows-per-page-options="tablePaginationPerPage"
	>
		<template v-slot:body="props">
			<q-tr :props="props" :class="clsx(props.row.finish ? 'disabled' : 'cursor-pointer')" @click="joinRoom(props.row.room)">

				<q-td key="room" :props="props">
					<q-chip clickable icon-right="link" color="secondary" text-color="white" @click="(e) => {roomUrlToClipboard(props.row.room, e)}">
						{{ props.row.room }}
					</q-chip>
				</q-td>

				<q-td key="map" :props="props">
					{{ props.row.map[0].toUpperCase() + props.row.map.substring(1) }}
				</q-td>

				<q-td key="scores" :props="props">
					{{ props.row.scores[0] }} - {{ props.row.scores[1] }}
				</q-td>

				<q-td key="players" :props="props">
					<div>

						<q-chip square :color="props.row.status == 'awaiting-player' ? 'orange' : 'green'">
							{{ countPlayers(props.row.players) + '/2' }}
						</q-chip>

						<q-tooltip>
							<q-avatar square>
								<img :src="props.row.avatars[0] ? props.row.avatars[0] : '/imgs/chat/default.webp'" v-if="props.row.players[0]">
							</q-avatar>
							{{ $t('game.listView.vs').toUpperCase() }}
							<q-avatar square>
								<img :src="props.row.avatars[1] ? props.row.avatars[1] : '/imgs/chat/default.webp'" v-if="props.row.players[1]">
							</q-avatar>
						</q-tooltip>

					</div>
				</q-td>

				<q-td key="status" :props="props">
					{{ props.row.status[0].toUpperCase() + props.row.status.replace(/-/g, ' ').substring(1) }}
				</q-td>

				<q-td key="createdAt" :props="props">
					{{ ((new Date(props.row.createdAt)).toLocaleString()) }}
				</q-td>

			</q-tr>
		</template>

	</q-table>
</template>

<style scoped>
</style>
