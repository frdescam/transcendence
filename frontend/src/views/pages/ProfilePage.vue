<template>
	<div class="q-pa-none">
		<profileHeader
			:user="user"
		></profileHeader>
		<div class="row justify-evenly">
			<div class="col-12 col-md-6 q-py-md q-pl-md" v-bind:class=" $q.screen.lt.md ? 'q-pr-md' : 'q-pr-sm'">
				<matchesList
					:matches="matches"
				></matchesList>
			</div>
            <div class="col-12 col-md-6  q-py-md q-pr-md" v-bind:class=" $q.screen.lt.md ? 'q-pl-md' : 'q-pl-sm'">
				<achievementsList
					:achievements="achievements"
				></achievementsList>
			</div>
		</div>
	</div>
</template>
<script>

import matchesList from 'src/components/profilePage/MatchesList.vue';
import achievementsList from 'src/components/profilePage/AchievementsList.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';

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
		return {
			user,
			matches,
			achievements
		};
	}
};
</script>
