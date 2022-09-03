<template>
  <q-list class="row justify-evenly shadow-2 rounded-borders bg-white">
    <q-toolbar>
      <q-toolbar-title class="q-pa-md">Your friends :</q-toolbar-title>
      <q-input borderless dense debounce="300" v-model="filter" @update:model-value="onFilterChange" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
    </q-toolbar>
    <q-item v-for="friend in filteredFriends" :key="friend.id" clickable v-ripple @click="onFriendClick(friend.user.pseudo)" class="column q-ma-md q-pa-none rounded-borders shadow-2" style="width: 300px">
      <q-responsive :ratio="1" class="full-width">
        <q-avatar rounded class="full-width full-height">
          <img :src='friend.user.avatar'>
        </q-avatar>
      </q-responsive>
      <div class="column items-center q-pt-xl">
        <div class="absolute full-width row justify-evenly" style="top: 300px; transform: translateY(-50%);">
          <q-btn round fab icon="chat" color="primary" :href="'chat/' + friend.pseudo" v-on:click.stop>
            <q-tooltip :delay="500">send message</q-tooltip>
          </q-btn>
          <q-btn round fab icon="person_remove" color="primary" @click="onDeleteFriend(friend.id)" v-on:click.stop>
            <q-tooltip :delay="500">delete friend</q-tooltip>
          </q-btn>
          <q-btn v-if="friend.status == 'playing'" fab icon="visibility" color="primary" :href="'game/' + friend.pseudo/* TODO : replace with party id */" v-on:click.stop>
            <q-tooltip :delay="500">watch game</q-tooltip>
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
            <div>{{ friend.user.pseudo }}</div>
          <div class="q-ml-sm text-weight-bold">#{{ friend.user.rank }}</div>
        </div>
        <div style="font-size: 1.5em;">Level : {{ parseInt(friend.user.xp) }}</div>
        <div class="q-pb-md" style="font-size: 1em;">ratio : {{ friend.user.ratio }}%</div>
      </div>
    </q-item>
    <div v-if="filteredFriends.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
      <q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
      No matching records found
    </div>
    <div v-if="filteredFriends.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
      <q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
      No data available
    </div>
  </q-list>
</template>

<script lang="ts">
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';
import { AxiosInstance } from 'axios';
import { inject } from 'vue';

export default {
	name: 'FriendsPage',
	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const router = useRouter();
		const filter = ref('');
		const friends = ref([]);
		const filteredFriends = ref([]);

		api.get('/friends/accepted').then((res) =>
		{
			friends.value = res.data;
			onFilterChange(filter.value);
		});

		function onFriendClick (friendPseudo)
		{
			router.push('/profile/' + friendPseudo);
		}

		function onFilterChange (value: string)
		{
			filteredFriends.value = friends.value.filter(friend => friend.user.pseudo.toLowerCase().includes(value.toLowerCase()));
		}

		async function onDeleteFriend (friendId)
		{
			// TODO : request backend to delete friendship
			console.log(friendId);
		}

		return {
			filteredFriends,
			filter,

			onFriendClick,
			onFilterChange,
			onDeleteFriend
		};
	}
};
</script>
