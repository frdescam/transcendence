<template>
  <q-list class="row q-ma-md justify-evenly shadow-2 rounded-borders bg-white">
    <q-toolbar class="row justify-evenly q-my-lg">
      <profileHeader :user="user"></profileHeader>
    </q-toolbar>
    <q-list class="column q-mt-md">
      <q-btn class="q-mb-md" :to="{ path: '/play' }" color="primary">Start a game</q-btn>
      <q-btn class="q-mb-md" :to="{ path: '/chat' }" color="primary">Chat with your friends</q-btn>
      <q-btn class="q-mb-md" :to="{ path: '/play/list' }" color="primary">Check out live games</q-btn>
    </q-list>
    <q-list class="column q-mt-md">
      <q-btn class="q-mb-md" :to="{ path: '/leaderboard' }" color="primary">Checkout the leaderboard</q-btn>
      <q-btn class="q-mb-xs" :to="{ path: '/settings' }" color="primary">Edit your settings</q-btn>
    </q-list>
	<q-list class="rounded-borders shadow-2 q-my-md scroll" style="width: 300px; height: 300px">
		<q-toolbar>
		<q-toolbar-title :hidden="!hideSearch">Your Friends : </q-toolbar-title>
			<q-input :hidden="hideSearch" ref="input" borderless dense debounce="300" v-model="filter" @update:model-value="onFilterChange" placeholder="Search"/>
			<q-btn flat rounded class="q-ml-auto" icon="search" @click="toggleSearch"/>
			<q-btn flat rounded class="q-ml-auto" icon="open_in_full" :to="{name: 'friends'}"/>
		</q-toolbar>
		<q-item v-for="friend in filteredFriendList" v-bind:key="friend.id" clickable v-ripple @click="onFriendClick(friend.user.id)" class="q-ma-md q-pa-md rounded-borders shadow-2 row items-center" style="width: 260px">
				<q-avatar>
					<img :src='friend.user.avatar'>
				</q-avatar>
				<div class="q-ml-md">{{ friend.user.pseudo }}</div>
		</q-item>
			<div v-if="filteredFriendList.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
			<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
			No matching records found
		</div>
		<div v-if="filteredFriendList.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
			<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
			No data available
		</div>
	</q-list>
  </q-list>
  <q-dialog v-model="user.new_user">
    <div class="q-pa-md" style="background-color: white; max-width: 400px;">
      <h5 class="q-ma-md">You can edit your pseudo and profile picture right here:</h5>
      <q-card bordered style='width: 300px;' class="q-ma-md">
        <q-card-section>
          <pseudoEditing :pseudo='user.pseudo' v-on:update:pseudo="user.pseudo = $event"></pseudoEditing>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <pictureEditing :avatar='user.avatar'></pictureEditing>
        </q-card-section>
      </q-card>
      <q-btn @click="onDimmissPopup" flat v-close-popup>Dismiss</q-btn>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';

export default ({
	name: 'WelcomePage',
	components: {
		profileHeader,
		pseudoEditing,
		pictureEditing
	},

	setup ()
	{
		const user = ref({});
		const router = useRouter();
		const friendList = ref([]);
		const filteredFriendList = ref([]);
		const hideSearch = ref(true);
		const filter = ref('');
		const input = ref();

		async function fetchUserInfo ()
		{
			const res = await api.get('/user/me', {});
			console.log(res.data);
			user.value = res.data;
		}
		async function fetchFriendList ()
		{
			const res = await api.get('/friends/accepted');
			friendList.value = res.data;
			onFilterChange(filter.value);
		}

		async function onDimmissPopup ()
		{
			api.get('/user/new');
		}

		async function onFriendClick (friendPseudo)
		{
			router.push('/profile/' + friendPseudo);
		}

		async function toggleSearch ()
		{
			hideSearch.value = !hideSearch.value;
			setTimeout(() =>
			{
				input.value.focus();
			}, 100);
		}

		async function onFilterChange (value: string)
		{
			filteredFriendList.value = friendList.value.filter(friend => friend.user.pseudo.toLowerCase().includes(value.toLowerCase()));
		}

		onMounted(() =>
		{
			fetchUserInfo();
			fetchFriendList();
		});

		return {
			user,
			friendList,
			hideSearch,
			filter,
			filteredFriendList,
			input,

			toggleSearch,
			onDimmissPopup,
			onFilterChange,
			onFriendClick
		};
	}
});
</script>
