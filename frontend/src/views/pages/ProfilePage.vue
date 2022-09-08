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
					</q-avatar>
				</div>
				<profileHeader :user="user"></profileHeader>
			</div>
			<q-item v-if="!ownPage" class="full-width row justify-around">
				<q-btn @click="friendAction()" class="action_button" :label="getFriendLabel()" :disable="friendStatus === FriendStatus.loading" />
				<q-btn :to="{ name: 'chat' }" class="action_button" :label="$t('profil.page.message')" />
				<q-btn @click="onToggleBlockUser()" class="action_button" :label="(isUserIgnored) ? $t('profil.page.unblock') : $t('profil.page.block')" />
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

enum FriendStatus
{
	loading,
	none,
	asked,
	asking,
	friend,
}

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
		const profileUserId: number = +route.params.id;
		const user = ref({});
		const matches = ref([]);
		const achievements = ref([]);
		const ownPage = ref(false);
		const isUserIgnored = ref(false);
		const friendStatus = ref<FriendStatus>(FriendStatus.loading);

		ownPage.value = (state.myself.id === profileUserId);

		[
			api.get('/user/match/get/' + profileUserId).then((res) =>
			{
				user.value = res.data;
				matches.value = user.value.matchesForeign.concat(user.value.matchesHome);
			}),
			api.get('/user/achievements/get/' + profileUserId).then((res) =>
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

		function onToggleBlockUser ()
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
			if (!ret || ret.data.user.id !== state.myself.id || ret.data.target.id !== user.value.id)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'alreadyBlocked'))
				return;
			isUserIgnored.value = true;
		});

		socket.on('blocked::receive::remove', (ret) =>
		{
			if (!ret || ret.data.user.id !== state.myself.id || ret.data.target.id !== user.value.id)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'notBlocked') || ret.data.deleted === false)
				return;
			isUserIgnored.value = false;
		});

		function getFriendLabel ()
		{
			switch (friendStatus.value)
			{
			case FriendStatus.friend:
				return t('profil.page.remove');
			case FriendStatus.asking:
				return t('profil.page.accept');
			case FriendStatus.asked:
				return t('profil.page.cancel');
			case FriendStatus.none:
				return t('profil.page.friend');

			default:
				return '...';
			}
		}

		function removeFriend ()
		{
			friendStatus.value = FriendStatus.loading;
			catchAxios(
				api.delete('/friends/delete', {
					data: {
						id: profileUserId
					}
				})
					.then(() =>
					{
						friendStatus.value = FriendStatus.none;
					})
					.catch((err) =>
					{
						friendStatus.value = FriendStatus.friend;
						return (err);
					})
			);
		}

		function addFriend ()
		{
			friendStatus.value = FriendStatus.loading;
			catchAxios(
				api.post('/friends', {
					id: profileUserId
				})
					.then(({ data: { isPending } }: any) =>
					{
						if (isPending)
							friendStatus.value = FriendStatus.asked;
						else
							friendStatus.value = FriendStatus.friend;
					})
					.catch((err) =>
					{
						friendStatus.value = FriendStatus.none;
						return (err);
					})
			);
		}

		function friendAction ()
		{
			if (friendStatus.value === FriendStatus.friend || friendStatus.value === FriendStatus.asked)
				removeFriend();
			else
				addFriend();
		}

		const disconnect = (reason: Socket.DisconnectReason) =>
		{
			if (reason === 'io server disconnect')
				socket.connect();
		};

		onMounted(() =>
		{
			socket.on('disconnect', disconnect);
			socket.connect();

			catchAxios(
				api.post('/friends/status', {
					id: profileUserId
				})
					.then(({ data }: any) =>
					{
						if (data.friend)
							friendStatus.value = FriendStatus.friend;
						else if (data.asking)
							friendStatus.value = FriendStatus.asking;
						else if (data.asked)
							friendStatus.value = FriendStatus.asked;
						else
							friendStatus.value = FriendStatus.none;
					})
			);
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

			onToggleBlockUser,
			getFriendLabel,
			friendAction,
			friendStatus,
			FriendStatus
		};
	}
};
</script>

<style scoped>
.action_button
{
	color: #eee;
	background: rgba(0, 0, 0, 0.4);
}
</style>
