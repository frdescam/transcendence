
<template>
  <q-list class="row justify-evenly shadow-2 rounded-borders bg-white">
    <q-toolbar>
      <q-toolbar-title class="q-pa-md">{{ capitalize($t('friend.title')) }}</q-toolbar-title>
      <q-input borderless dense debounce="300" v-model="filter" @update:model-value="onFilterChange" :placeholder="capitalize($t('friend.search'))">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
    </q-toolbar>
    <q-item v-for="friend in filteredFriends" :key="friend.id" clickable v-ripple @click="onFriendClick(friend.id)" class="column q-ma-md q-pa-none rounded-borders shadow-2" style="width: 300px">
      <q-responsive :ratio="1" class="full-width">
        <q-avatar rounded class="full-width full-height">
          <img :src='friend.avatar'>
        </q-avatar>
      </q-responsive>
      <div class="column items-center q-pt-xl">
        <div class="absolute full-width row justify-evenly" style="top: 300px; transform: translateY(-50%);">
          <q-btn round fab icon="chat" color="primary" :to="{ name: 'chat' }" v-on:click.stop>
            <q-tooltip :delay="500">{{ capitalize($t('friend.message')) }}</q-tooltip>
          </q-btn>
          <q-btn round fab icon="person_remove" color="primary" @click="onDeleteFriend(friend.id)" v-on:click.stop>
            <q-tooltip :delay="500">{{ capitalize($t('friend.delete')) }}</q-tooltip>
          </q-btn>
          <q-btn v-if="friend.isPlaying" fab icon="visibility" color="primary" :href="'game/' + friend.partyRoom" v-on:click.stop>
            <q-tooltip :delay="500">{{ capitalize($t('friend.watch')) }}</q-tooltip>
          </q-btn>
        </div>
        <div class="row" style="font-size: 2em;">
          <q-badge v-if="friend.connected && !friend.isPlaying" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="light-green-14" rounded>
            <q-tooltip>{{ friend.status }}</q-tooltip>
          </q-badge>
          <q-badge v-if="!friend.connected" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="red" rounded>
            <q-tooltip>{{ friend.status }}</q-tooltip>
          </q-badge>
          <q-badge v-if="friend.isPlaying" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="orange" rounded>
            <q-tooltip>{{ friend.status }}</q-tooltip>
          </q-badge>
            <div>{{ friend.pseudo }}</div>
          <div class="q-ml-sm text-weight-bold">{{ $t('friend.rank', { rank: friend.rank }) }}</div>
        </div>
        <div style="font-size: 1.5em;">{{ capitalize($t('friend.level', { level: parseInt(friend.xp) })) }}</div>
        <div class="q-pb-md" style="font-size: 1em;">{{ capitalize($t('friend.ratio', { ratio: friend.ratio })) }}%</div>
      </div>
    </q-item>
    <div v-if="filteredFriends.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
      <q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
      {{ capitalize($t('friend.noMatch')) }}
    </div>
    <div v-if="filteredFriends.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
      <q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
      {{ capitalize($t('friend.noData')) }}
    </div>
  </q-list>
</template>

<script lang="ts">
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';
import { AxiosInstance } from 'axios';
import { inject, onUnmounted, onBeforeUnmount, onMounted, watch } from 'vue';
import { Capitalize } from 'src/boot/libs';
import type { catchAxiosType } from 'src/boot/axios';
import { Socket } from 'socket.io-client';
import type { getUserPartyDto } from 'src/common/game/orm/getUserParty.dto';

export default {
	name: 'FriendsPage',
	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const catchAxios = inject('catchAxios') as catchAxiosType;
		const router = useRouter();
		const filter = ref('');
		const friends = ref<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
		const filteredFriends = ref<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
		const gameSocket: Socket = inject('socketGame') as Socket;

		function onDisconnect (reason?: Socket.DisconnectReason)
		{
			for (const friend of friends.value)
			{
				gameSocket.emit('game::userinfos::leave', {
					id: friend.id
				});
			}
			if (typeof reason !== 'undefined' && reason === 'io server disconnect')
				gameSocket.connect();
		}

		function onConnected ()
		{
			for (const friend of friends.value)
			{
				gameSocket.emit('game::userinfos::join', {
					id: friend.id
				});
			}
		}

		function onUpdate (data: getUserPartyDto)
		{
			for (const friend of friends.value)
			{
				if (data.userId === friend.id)
				{
					if (data.party)
					{
						friend.isPlaying = true;
						friend.partyRoom = data.party.room;
					}
					else
					{
						friend.isPlaying = false;
						friend.partyRoom = null;
					}
					break;
				}
			}
		}

		async function fetchFriends ()
		{
			catchAxios(
				api.get('/friends/accepted').then((res) =>
				{
					friends.value = res.data;
					gameSocket.on('disconnect', onDisconnect);
					gameSocket.on('connect', onConnected);
					gameSocket.on('game::userinfos', onUpdate);
					gameSocket.connect();

					if (gameSocket.connected)
						onConnected();
					onFilterChange(filter.value);
				})
			);
		}

		fetchFriends();

		function onFriendClick (friendId: number)
		{
			router.push('/profile/' + friendId);
		}

		function onFilterChange (value: string)
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			filteredFriends.value = friends.value.filter((friend: any) =>
				(value)
					? friend.pseudo.toLowerCase().includes(value.toLowerCase())
					: friend.pseudo.toLowerCase()
			);
		}

		async function onDeleteFriend (friendId: number)
		{
			const getFriends = () =>
			{
				for (const i in filteredFriends.value)
				{
					if (filteredFriends.value[i].id === friendId)
						return Number(i);
				}
				return -1;
			};
			catchAxios(
				api.delete('/friends/delete', {
					data: { id: friendId }
				}).then(() =>
				{
					const i = getFriends();
					if (i !== -1)
						filteredFriends.value.splice(i, 1);
				})
			);
		}

		onMounted(() =>
		{
			watch(() => friends.value, () =>
			{
				onFilterChange(filter.value);
			},
			{
				flush: 'post'
			});
		});

		onUnmounted(() => gameSocket.disconnect());

		onBeforeUnmount(() =>
		{
			onDisconnect();
			gameSocket.off('game::userinfos', onUpdate);
			gameSocket.off('disconnect', onDisconnect);
			gameSocket.off('connect', onConnected);
		});

		return {
			capitalize,

			filteredFriends,
			filter,

			onFriendClick,
			onFilterChange,
			onDeleteFriend
		};
	}
};
</script>
