<template>
	<div class="q-pa-none">
		<!-- HEADER -->
		<div class="column" style="background-image: url(user_profile_background.png); background-position: center; background-size: cover; background-repeat: no-repeat;">
			<div class="q-pa-md full-width row items-center">
				<div v-bind:class="{ 'q-pr-md': $q.screen.gt.sm }" class="q-my-lg row full-height items-center justify-around col-md-2 col-12">
					<q-avatar class="q-my-auto" size=150px>
						<img src='https://cdn.quasar.dev/img/boy-avatar.png'>
							<q-badge v-if="online" class="absolute-bottom-right" style="width: 30px; height: 30px" color="light-green-14" rounded></q-badge>
							<q-badge v-else class="absolute-bottom-right" style="width: 30px; height: 30px" color="red" rounded></q-badge>
							<q-tooltip v-if="online">Online</q-tooltip>
							<q-tooltip v-else>Offline</q-tooltip>
					</q-avatar>
				</div>
				<div class="col-md-10 col-12">
					<div class="fit column q-pa-sm" style="background: rgba(0, 0, 0, 0.4); border-radius: 10px">
						<div class="q-pa-sm row col-3 items-center">
							<div v-bind:class="{ 'justify-center': $q.screen.lt.md }" class="col-12 col-md-6 row" style="height: 4em">
								<div style="font-size: 3em; color: #eee;">Frdescam</div>
								<div class="text-weight-bold q-ml-sm" style="font-size: 3em; color: #eee;">#101</div>
							</div>
							<div v-bind:class=" $q.screen.lt.md ? 'text-center' : 'text-right' " class="col-12 col-md-6" style="font-size: 1.5em; color: #eee;">Ratio : 42%</div>
						</div>
						<q-badge class="col-5 q-mx-auto" style="font-size: 3em; color: #eee; height: 75px; background: rgba(0, 0, 0, 0.4); border-radius: 15px">Level 42</q-badge>
						<div class="row justify-between col-2 items-end">
							<div style="color: #eee;" class="q-mb-none">Next level :</div>
							<div style="color: #eee;" class="q-mb-none">42 / 100 XP</div>
						</div>
						<div class="col-2">
							<q-linear-progress stripe rounded class="q-mt-sm" size="20px" value="0.42" color="blue"/>
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
			online: true,
			matches,
			achievements
		};
	}
};
</script>
