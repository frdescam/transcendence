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
				<q-btn @click="onDeleteFriend()" style="background: rgba(0, 0, 0, 0.4); color: #eee;"
					label="add friend" />
				<q-btn :href="'chat/' + user.pseudo" style="background: rgba(0, 0, 0, 0.4); color: #eee;"
					label="send a message" />
				<q-btn @click="onBlockUser()" style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="block user" />
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

		api.get('/user/' + userId).then((res) =>
		{
			user.value = res.data;
			api.get('/user/me').then((res) =>
			{
				ownPage.value = (res.data.id === user.value.id);
			});
		});

		async function onDeleteFriend ()
		{
			console.log('removing friend!');
		}

		async function onBlockUser ()
		{
			api.post('/ignore', {
				id: user.value.id
			});
		}

		return {
			user,
			matches,
			achievements,
			ownPage,

			onDeleteFriend,
			onBlockUser
		};
	}
};
</script>
