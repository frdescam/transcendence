<template>
	<q-page class="row items-start justify-evenly">
		<q-list class="row q-ma-md justify-evenly shadow-2 rounded-borders">
			<q-toolbar class="row justify-evenly q-my-lg">
				<profileHeader :user="user"></profileHeader>
			</q-toolbar>
			<q-list class="column q-mt-md">
				<q-btn class="q-mb-md" :to="{ path: '/play' }" color="primary">Start a game</q-btn>
				<q-btn class="q-mb-md" :to="{ path: '/chat' }" color="primary">Chat with your friends</q-btn>
				<q-btn class="q-mb-md" :to="{ path: '/listgames' }" color="primary">Check out live games</q-btn>
			</q-list>
			<q-list class="column q-mt-md">
				<q-btn class="q-mb-md" :to="{ path: '/leaderboard' }" color="primary">Checkout the leaderboard</q-btn>
				<q-btn class="q-mb-xs" :to="{ path: '/settings' }" color="primary">Edit your settings</q-btn>
			</q-list>
			<q-list bordered class="rounded-borders q-my-md">
				<q-item v-if="friendList.length == 0">No friends to display yet!</q-item>
				<q-item v-else clickable v-ripple v-for="friend in friendList" v-bind:key="friend.id">
					<q-item-section>
						{{friend}}
					</q-item-section>
				</q-item>
			</q-list>
		</q-list>
		<q-dialog v-model="firstConnection">
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
				<q-btn flat v-close-popup>Dismiss</q-btn>
			</div>
		</q-dialog>
	</q-page>
</template>

<script lang="ts">
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';
import { ref, onMounted } from 'vue';
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
		const firstConnection = ref(true);
		const user = ref({});
		const friendList = ref([]);

		async function fetchUserInfo ()
		{
			const res = await api.get('/user/me', {});
			console.log(res.data);
			user.value = res.data;
		}
		async function fetchFriendList ()
		{
			const res = await api.get('/friends/accepted');
			console.log(res.data);
			friendList.value = res.data;
		}

		onMounted(() =>
		{
			fetchUserInfo();
			fetchFriendList();
		});

		return {
			user,
			firstConnection,
			friendList
		};
	}
});
</script>
