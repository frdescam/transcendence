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
						</q-badge>
						<q-badge v-if="!user.connected" class="absolute-bottom-right"
							style="width: 30px; height: 30px" color="red" rounded>
						</q-badge>
						<q-badge v-if="user.connected == 'playing'" class="absolute-bottom-right"
							style="width: 30px; height: 30px" color="orange" rounded>
						</q-badge>
					</q-avatar>
				</div>
				<profileHeader :user="user"></profileHeader>
			</div>
			<q-item v-if="!ownPage" class="full-width row justify-around">
				<q-btn @click="onToggleFriend()" style="background: rgba(0, 0, 0, 0.4); color: #eee;" :label="toggleFriend()" />
				<q-btn :to="{ name: 'chat' }" style="background: rgba(0, 0, 0, 0.4); color: #eee;" :label="$t('profil.page.message')" />
				<q-btn @click="onToggleBlockUser()" style="background: rgba(0, 0, 0, 0.4); color: #eee;" :label="(isUserIgnored) ? $t('profil.page.unblock') : $t('profil.page.block')" />
			</q-item>
		</div>
		<div class="row justify-evenly">
			<div class="col-12 col-md-6 q-py-md q-pl-md" v-bind:class="$q.screen.lt.md ? 'q-pr-md' : 'q-pr-sm'">
				<matchesList :matches="matches" :user="user"></matchesList>
			</div>
			<div class="col-12 col-md-6  q-py-md q-pr-md" v-bind:class="$q.screen.lt.md ? 'q-pl-md' : 'q-pl-sm'">
				<achievementsList :achievements="achievements"></achievementsList>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import matchesList from 'src/components/profilePage/MatchesList.vue';
import achievementsList from 'src/components/profilePage/AchievementsList.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';
import { inject, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AxiosInstance } from 'axios';
import { Socket } from 'socket.io-client';
import type { catchAxiosType } from 'src/boot/axios';
import type { State } from 'src/boot/state';

export default {
	name: 'LeaderboardPage',
	components: {
		profileHeader,
		matchesList,
		achievementsList
	},
	setup ()
	{
		const { t } = useI18n();

		const state = inject('state') as State;
		const socket: Socket = inject('socketChat') as Socket;
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const catchAxios = inject('catchAxios') as catchAxiosType;
		const route = useRoute();
		const userId: number = +route.params.id;
		const user = ref({});
		const matches = ref([]);
		const achievements = ref([]);
		const ownPage = ref(false);
		const isUserIgnored = ref(false);
		const isUserFriend = ref(false);
		const isUserPendingFriend = ref(false);
		const isUserInvited = ref(false);
		let friendId: number;
		let pendingFriendId: number;

		ownPage.value = (state.myself.id === userId);

		[
			api.get('/user/match/get/' + userId).then((res) =>
			{
				user.value = res.data;
				matches.value = user.value.matchesForeign.concat(user.value.matchesHome);
			}),
			api.get('/user/achievements/get/' + userId).then((res) =>
			{
				achievements.value = res.data;
			}),
			api.get('/ignore').then((res) =>
			{
				const ignoredUsers = res.data;
				for (const ignoredUser of ignoredUsers)
				{
					if (ignoredUser.target.id === user.value.id)
					{
						isUserIgnored.value = true;
						break;
					}
				}
			})
		].map(catchAxios);

		async function onToggleBlockUser ()
		{
			if (isUserIgnored.value)
			{
				socket.emit('blocked::remove', {
					id: state.myself.id,
					blockedId: user.value.id
				});
			}
			else
			{
				socket.emit('blocked::add', {
					id: state.myself.id,
					blockedId: user.value.id
				});
			}
		}

		socket.on('blocked::receive::add', (ret) =>
		{
			if (!ret || ret.socketId !== socket.id)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'alreadyBlocked'))
				return;
			isUserIgnored.value = true;
		});

		socket.on('blocked::receive::remove', (ret) =>
		{
			if (!ret || ret.socketId !== socket.id)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'notBlocked') || ret.data.deleted === false)
				return;
			isUserIgnored.value = false;
		});

		catchAxios(
			api.get('user/me').then((res) =>
			{
				console.log(res);
			})
		);

		async function fetchFriends ()
		{
			isUserFriend.value = false;
			isUserInvited.value = false;
			isUserPendingFriend.value = false;

			[
				api.get('/friends/accepted').then((res) =>
				{
					const friendUsers = res.data;
					for (const friendUser of friendUsers)
					{
						if (friendUser.id === user.value.id)
						{
							isUserFriend.value = true;
							friendId = user.value.id;
							return;
						}
					}
					isUserFriend.value = false;
				}),
				api.get('/friends/pending').then((res) =>
				{
					const pendingFriendUsers = res.data;
					console.log(res.data);
					for (const pendingFriendUser of pendingFriendUsers)
					{
						if (pendingFriendUser.id === user.value.id)
						{
							isUserPendingFriend.value = true;
							pendingFriendId = pendingFriendUser.id;
							return;
						}
					}
					isUserInvited.value = true;
					isUserPendingFriend.value = false;
				})
			].map(catchAxios);
		}

		fetchFriends();

		async function onToggleFriend ()
		{
			if (isUserFriend.value)
			{
				catchAxios(
					api.delete('/friends/delete', {
						data: { id: friendId }
					}).then((res) =>
					{
						if (!res.data.delete)
							console.log('delete friend failed');
						else
							fetchFriends();
					})
				);
			}
			else if (isUserPendingFriend.value)
			{
				catchAxios(
					api.delete('friends/delete', {
						data: { id: pendingFriendId }
					}).then((res) =>
					{
						if (!res.data.delete)
							console.log('delete pending friend failed');
						else
							fetchFriends();
					})
				);
			}
			else
			{
				catchAxios(
					api.post('/friends', {
						id: user.value.id
					}).then((res) =>
					{
						console.log('post', res);
						fetchFriends();
					})
				);
			}
		}

		const toggleFriend = () =>
		{
			if (isUserFriend.value)
				return t('profil.page.remove');
			else if (isUserPendingFriend.value)
				return t('profil.page.cancel');
			else if (isUserInvited.value)
				return t('profil.page.accept');
			return t('profil.page.friend');
		};

		const disconnect = (reason: Socket.DisconnectReason) =>
		{
			if (reason === 'io server disconnect')
				socket.connect();
		};

		onMounted(() =>
		{
			socket.on('disconnect', disconnect);
			socket.connect();
		});

		onUnmounted(() =>
		{
			socket.off('disconnect', disconnect);
			socket.disconnect();
		});

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
			onToggleFriend,
			toggleFriend
		};
	}
};
</script>
