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
    <q-item v-for="friend in filteredFriends" :key="friend.id" clickable v-ripple @click="onFriendClick(friend.user.id)" class="column q-ma-md q-pa-none rounded-borders shadow-2" style="width: 300px">
      <q-responsive :ratio="1" class="full-width">
        <q-avatar rounded class="full-width full-height">
          <img :src='friend.avatar'>
        </q-avatar>
      </q-responsive>
      <div class="column items-center q-pt-xl">
        <div class="absolute full-width row justify-evenly" style="top: 300px; transform: translateY(-50%);">
          <q-btn round fab icon="chat" color="primary" :href="'chat/' + friend.pseudo" v-on:click.stop>
            <q-tooltip :delay="500">{{ capitalize($t('friend.message')) }}</q-tooltip>
          </q-btn>
          <q-btn round fab icon="person_remove" color="primary" @click="onDeleteFriend(friend.id)" v-on:click.stop>
            <q-tooltip :delay="500">{{ capitalize($t('friend.delete')) }}</q-tooltip>
          </q-btn>
          <q-btn v-if="friend.status == 'playing'" fab icon="visibility" color="primary" :href="'game/' + friend.pseudo/* TODO : replace with party id */" v-on:click.stop>
            <q-tooltip :delay="500">{{ capitalize($t('friend.watch')) }}</q-tooltip>
          </q-btn>
        </div>
        <div class="row" style="font-size: 2em;">
          <q-badge v-if="friend.status == 'online'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="light-green-14" rounded>
            <q-tooltip>{{ friend.status }}</q-tooltip>
          </q-badge>
          <q-badge v-if="friend.status == 'offline'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="red" rounded>
            <q-tooltip>{{ friend.status }}</q-tooltip>
          </q-badge>
          <q-badge v-if="friend.status == 'playing'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="orange" rounded>
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
import { inject, onMounted, watch } from 'vue';
import { Capitalize } from 'src/boot/libs';

export default {
	name: 'FriendsPage',
	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const router = useRouter();
		const filter = ref('');
		const friends = ref([]);
		const filteredFriends = ref([]);

		async function fetchFriends ()
		{
			api.get('/friends/accepted').then((res) =>
			{
				friends.value = res.data;
				onFilterChange(filter.value);
			});
		}

		fetchFriends();

		function onFriendClick (friendPseudo: number)
		{
			router.push('/profile/' + String(friendPseudo));
		}

		function onFilterChange (value: string)
		{
			filteredFriends.value = friends.value.filter((friend: any) =>
				(value)
					? friend.pseudo.toLowerCase().includes(value.toLowerCase())
					: friend.pseudo.toLowerCase()
			);
		}

		async function onDeleteFriend (friendId: number)
		{
			api.delete('/friends/delete', {
				data: { id: friendId }
			}).then(() =>
			{
				fetchFriends();
			});
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
