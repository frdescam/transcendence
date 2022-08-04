<template>
	<div class="q-pa-none">
		<!-- HEADER -->
		<div class="column" style="background-image: url(user_profile_background.png); background-position: center; background-size: cover; background-repeat: no-repeat;">
			<div class="q-pa-md full-width row items-center">
				<div v-bind:class="{ 'q-pr-md': $q.screen.gt.sm }" class="q-my-lg row full-height items-center justify-around col-md-2 col-12">
					<q-avatar class="q-my-auto" size=150px>
						<img :src='computedUser.avatar'>
							<q-badge v-if="computedUser.status == 'online'" class="absolute-bottom-right" style="width: 30px; height: 30px" color="light-green-14" rounded>
								<q-tooltip>{{computedUser.status}}</q-tooltip>
							</q-badge>
							<q-badge v-if="computedUser.status == 'offline'" class="absolute-bottom-right" style="width: 30px; height: 30px" color="red" rounded>
								<q-tooltip>{{computedUser.status}}</q-tooltip>
							</q-badge>
							<q-badge v-if="computedUser.status == 'playing'" class="absolute-bottom-right" style="width: 30px; height: 30px" color="orange" rounded>
								<q-tooltip>{{computedUser.status}}</q-tooltip>
							</q-badge>
					</q-avatar>
				</div>
				<div class="col-md-10 col-12">
					<div class="fit column q-pa-sm" style="background: rgba(0, 0, 0, 0.4); border-radius: 10px">
						<div class="q-pa-sm row col-3 items-center">
							<div v-bind:class="{ 'justify-center': $q.screen.lt.md }" class="col-12 col-md-6 row" style="height: 4em">
								<div style="font-size: 3em; color: #eee;">{{computedUser.pseudo}}</div>
								<div class="text-weight-bold q-ml-sm" style="font-size: 3em; color: #eee;">#{{computedUser.rank}}</div>
							</div>
							<div v-bind:class=" $q.screen.lt.md ? 'text-center' : 'text-right' " class="col-12 col-md-6" style="font-size: 1.5em; color: #eee;">Ratio : {{computedUser.ratio}}%</div>
						</div>
						<q-badge class="col-5 q-mx-auto" style="font-size: 3em; color: #eee; height: 75px; background: rgba(0, 0, 0, 0.4); border-radius: 15px">Level {{computedUser.level}}</q-badge>
						<div class="row justify-between col-2 items-end">
							<div style="color: #eee;" class="q-mb-none">Next level :</div>
							<div style="color: #eee;" class="q-mb-none">{{computedUser.xpToNextLevel}} / 100 XP</div>
						</div>
						<div class="col-2">
							<q-linear-progress stripe rounded class="q-mt-sm" size="20px" :value="computedUser.xpToNextLevel / 100" color="blue"/>
						</div>
					</div>
				</div>
			</div>
			<q-item class="full-width row justify-around">
				<q-btn style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="add friend"/>
				<q-btn style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="send a message"/>
				<q-btn style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="block user"/>
			</q-item>
		</div>
		<!-- END HEADER -->
		<div class="row justify-evenly">
			<!-- MATCHES -->
			<div class="col-12 col-md-6 q-py-md q-pl-md" v-bind:class=" $q.screen.lt.md ? 'q-pr-md' : 'q-pr-sm'">
				<matchesList
					:matches="matches"
				></matchesList>
			</div>
			<!-- MATCHES END -->
			<!-- ACHIEVEMENTS -->
            <div class="col-12 col-md-6  q-py-md q-pr-md" v-bind:class=" $q.screen.lt.md ? 'q-pl-md' : 'q-pl-sm'">
				<achievementsList
					:achievements="achievements"
				></achievementsList>
			</div>
			<!-- ACHIEVEMENTS END -->
		</div>
	</div>
</template>
<script>

import matchesList from 'src/components/profilePage/MatchesList.vue';
import achievementsList from 'src/components/profilePage/AchievementsList.vue';

const user = {
	id: 1,
	fortytwo_id: 56455,
	pseudo: 'fdeĉ',
	refresh_token: 'null',
	email: 'lol',
	password: 'k',
	avatar: 'https://cdn.intra.42.fr/users/frdescam.jpg',
	is2FActive: false,
	secretOf2FA: 'k',
	xp: 4.2,
	ratio: 42,
	rank: 101,
	status: "online"
};

const computedUser = {
	id: user.id,
	fortytwo_id: user.fortytwo_id,
	pseudo: user.pseudo,
	refresh_token: user.refresh_token,
	email: user.email,
	password: user.password,
	avatar: user.avatar,
	is2FActive: user.is2FActive,
	secretOf2FA: user.secretOf2FA,
	level: parseInt(user.xp),
	xpToNextLevel: parseInt((user.xp - parseInt(user.xp)) * 100),
	ratio: user.ratio,
	rank: user.rank,
	status: user.status
};

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
		achievementName: 'Rigorous Basterd',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/02/2022',
		achievementName: 'Rigorous Basterd',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/03/2022',
		achievementName: 'Rigorous Basterd',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/04/2022',
		achievementName: 'Rigorous Basterd',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/05/2022',
		achievementName: 'Rigorous Basterd',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	},
	{
		id: 1,
		timestamp: '03/06/2022',
		achievementName: 'Rigorous Basterd',
		achievementDescription: 'Win 10 matches in a row',
		achievementIcon: 'https://cdn.intra.42.fr/achievement/image/26/PRO010.svg'
	}
];

export default {
	name: 'LeaderboardPage',
	components: {
		matchesList,
		achievementsList
	},
	setup ()
	{
		return {
			computedUser,
			matches,
			achievements
		};
	}
};
</script>
