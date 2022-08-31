<template>
	<div class="q-pa-none">
		<div class="column">
			<div class="q-pa-md full-width row items-center">
				<div v-bind:class="{ 'q-pr-md': $q.screen.gt.sm }"
					class="q-my-lg row full-height items-center justify-around col-md-2 col-12">
					<q-avatar class="q-my-auto" size=150px>
						<img :src='user.avatar'>
						<q-badge v-if="user.connected" class="absolute-bottom-right"
							style="width: 30px; height: 30px" color="light-green-14" rounded>
							<q-tooltip>{{ user.connected }}</q-tooltip>
						</q-badge>
						<q-badge v-if="!user.connected" class="absolute-bottom-right"
							style="width: 30px; height: 30px" color="red" rounded>
							<q-tooltip>{{ user.connected }}</q-tooltip>
						</q-badge>
						<q-badge v-if="user.connected == 'playing'" class="absolute-bottom-right"
							style="width: 30px; height: 30px" color="orange" rounded>
							<q-tooltip>{{ user.connected }}</q-tooltip>
						</q-badge>
					</q-avatar>
				</div>
				<profileHeader :user="user"></profileHeader>
			</div>
			<q-item v-if="!ownPage" class="full-width row justify-around">
				<q-btn @click="onToggleFriend()" style="background: rgba(0, 0, 0, 0.4); color: #eee;"
					:label="isUserFriend ? 'remove friend' : isUserPendingFriend ? 'cancel invitation' : isUserInvited ? 'accept invitation' : 'add friend'" /> <!-- Yeah very dirty i know, it works don't touch! -->
				<q-btn :href="'chat/' + user.pseudo" style="background: rgba(0, 0, 0, 0.4); color: #eee;"
					label="send a message" />
				<q-btn @click="onToggleBlockUser()" style="background: rgba(0, 0, 0, 0.4); color: #eee;"
					:label="isUserIgnored ? 'unblock user' : 'block user'" />
			</q-item>
		</div>
		<div class="row justify-evenly">
			<div class="col-12 col-md-6 q-py-md q-pl-md" v-bind:class="$q.screen.lt.md ? 'q-pr-md' : 'q-pr-sm'">
				<matchesList :matches="matches"></matchesList>
			</div>
			<div class="col-12 col-md-6  q-py-md q-pr-md" v-bind:class="$q.screen.lt.md ? 'q-pl-md' : 'q-pl-sm'">
				<achievementsList :achievements="achievements"></achievementsList>
			</div>
		</div>
	</div>
</template>
<script>

import matchesList from 'src/components/profilePage/MatchesList.vue';
import achievementsList from 'src/components/profilePage/AchievementsList.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';

const matches = [
	{
		id: 1,
		map: 'standard',
		userHome: 1,
		userForeign: 2,
		winner: 1,
		userHomeScore: 5,
		userForeignScore: 3,
		timestamp: '03/05/2021'
	},
	{
		id: 1,
		map: 'forest',
		userHome: 1,
		userForeign: 2,
		winner: 2,
		userHomeScore: 4,
		userForeignScore: 5,
		timestamp: '03/06/2021'
	},
	{
		id: 1,
		map: 'standard',
		userHome: 1,
		userForeign: 2,
		winner: 1,
		userHomeScore: 2000,
		userForeignScore: 3,
		timestamp: '03/07/2021'
	},
	{
		id: 1,
		map: 'standard',
		userHome: 1,
		userForeign: 2,
		winner: 1,
		userHomeScore: 5,
		userForeignScore: 3,
		timestamp: '03/08/2021'
	},
	{
		id: 1,
		map: 'standard',
		userHome: 1,
		userForeign: 2,
		winner: 1,
		userHomeScore: 5,
		userForeignScore: 3,
		timestamp: '03/09/2021'
	},
	{
		id: 1,
		map: 'standard',
		userHome: 1,
		userForeign: 2,
		winner: 1,
		userHomeScore: 5,
		userForeignScore: 3,
		timestamp: '03/10/2021'
	}
];

const achievements = [
	{
		id: 1,
		timestamp: '03/01/2022',
		achievementName: 'Rigorous Basterd1',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/02/2022',
		achievementName: 'Rigorous Basterd2',
		achievementDescription: 'Win 10 matches in a row 1',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/03/2022',
		achievementName: 'Rigorous Basterd3',
		achievementDescription: 'Win 10 matches in a row 2',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/04/2022',
		achievementName: 'Rigorous Basterd4',
		achievementDescription: 'Win 10 matches in a row 3',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/05/2022',
		achievementName: 'Rigorous Basterd4',
		achievementDescription: 'Win 10 matches in a row 4',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/06/2022',
		achievementName: 'Rigorous Basterd5',
		achievementDescription: 'Win 10 matches in a row 5',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	}
];

export default {
	name: 'LeaderboardPage',
	components: {
		profileHeader,
		matchesList,
		achievementsList
	},
	setup ()
	{
		const route = useRoute();
		const userId = route.params.id;
		const user = ref({});
		const ownPage = ref(false);
		const isUserIgnored = ref(false);
		const isUserFriend = ref(false);
		const isUserPendingFriend = ref(false);
		const isUserInvited = ref(false);
		let ignoreId;
		let friendId;
		let pendingFriendId;

		api.get('/user/' + userId).then((res) =>
		{
			user.value = res.data;
			api.get('/user/me').then((res) =>
			{
				ownPage.value = (res.data.id === user.value.id);
			});
		});

		async function fetchIgnore ()
		{
			api.get('/ignore').then((res) =>
			{
				const ignoredUsers = res.data;
				for (const ignoredUser of ignoredUsers)
				{
					if (ignoredUser.target.id === user.value.id)
					{
						isUserIgnored.value = true;
						ignoreId = ignoredUser.target.id;
						return;
					}
				}
				isUserIgnored.value = false;
			});
		}

		fetchIgnore();

		async function onToggleBlockUser ()
		{
			if (isUserIgnored.value)
			{
				api.delete('/ignore/delete', {
					data: { id: ignoreId }
				}).then(() =>
				{
					fetchIgnore();
				});
			}
			else
			{
				api.post('/ignore', {
					id: user.value.id
				}).then(() =>
				{
					fetchIgnore();
				});
			}
		}

		async function fetchFriends ()
		{
			api.get('/friends/accepted').then((res) =>
			{
				const friendUsers = res.data;
				for (const friendUser of friendUsers)
				{
					if (friendUser.followedUser.id === user.value.id || friendUser.user.id === user.value.id)
					{
						isUserFriend.value = true;
						friendId = friendUser.followedUser.id;
						return;
					}
				}
				isUserFriend.value = false;
			});

			api.get('/friends/pending').then((res) =>
			{
				const pendingFriendUsers = res.data;
				for (const pendingFriendUser of pendingFriendUsers)
				{
					if (pendingFriendUser.followedUser.id === user.value.id)
					{
						isUserPendingFriend.value = true;
						pendingFriendId = pendingFriendUser.followedUser.id;
						return;
					}
					else if (pendingFriendUser.user.id === user.value.id)
					{
						isUserInvited.value = true;
						pendingFriendId = pendingFriendUser.user.id;
					}
				}
				isUserPendingFriend.value = false;
			});
		}

		fetchFriends();

		async function onToggleFriend ()
		{
			if (isUserFriend.value)
			{
				api.delete('/friends/delete', {
					data: { id: friendId }
				}).then(() =>
				{
					fetchFriends();
				});
			}
			else if (isUserPendingFriend.value)
			{
				api.delete('friends/delete', {
					data: { id: pendingFriendId }
				}).then(() =>
				{
					fetchFriends();
				});
			}
			else
			{
				api.post('/friends', {
					id: user.value.id
				}).then(() =>
				{
					fetchFriends();
				});
			}
		}

		return {
			user,
			matches,
			achievements,
			ownPage,
			isUserIgnored,
			isUserFriend,
			isUserPendingFriend,
			isUserInvited,

			onToggleBlockUser,
			onToggleFriend
		};
	}
};
</script>
