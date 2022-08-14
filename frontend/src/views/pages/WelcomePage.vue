<template>
	<q-page class="row items-start justify-evenly">
		<q-list class="row q-ma-md justify-evenly shadow-2 rounded-borders">
			<q-toolbar class="row justify-evenly q-my-lg">
				<profileHeader :user="user"></profileHeader>
			</q-toolbar>
			<q-list bordered class="rounded-borders">
				<q-item clickable v-ripple>
					<q-item-section>
						friend one
					</q-item-section>
				</q-item>

				<q-item clickable v-ripple>
					<q-item-section>
						Friend two
					</q-item-section>
				</q-item>

				<q-item clickable v-ripple>
					<q-item-section>
						Friend three
					</q-item-section>
				</q-item>
			</q-list>
			<q-list class="column q-mt-md">
				<q-btn class="q-mb-md" :to="{ path: '/play' }" color="primary">Start a game</q-btn>
				<q-btn class="q-mb-md" :to="{ path: '/chat' }" color="primary">Chat with your friends</q-btn>
			</q-list>
			<q-list class="column q-mt-md">
				<q-btn class="q-mb-md" :to="{ path: '/leaderboard' }" color="primary">Checkout your score on the
					leaderboard</q-btn>
				<q-btn class="q-mb-xs" :to="{ path: '/settings' }" color="primary">Edit your settings</q-btn>
			</q-list>
		</q-list>
	</q-page>

    <q-dialog v-model="alert">
		<div class="column items-center">
			<h5 class="q-mb-md">You can edit you pseudo and profile picture right here:</h5>
			<q-card bordered style='width: 300px;' class="q-ma-md">
				<q-card-section>
					<pseudoEditing :username='user.pseudo'></pseudoEditing>
				</q-card-section>
				<q-separator inset />
				<q-card-section>
					<pictureEditing :picture='user.avatar'></pictureEditing>
				</q-card-section>
			</q-card>
			<q-btn class="q-mb-xs" :to="{ path: '/settings' }" color="primary">Or edit the rest of your settings
			</q-btn>
		</div>
	</q-dialog>
</template>

<script lang="ts">
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';

// v-if="firstConnection == true"

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
	status: 'online'
};

export default ({
	name: 'WelcomePage',
	components: {
		profileHeader,
		pseudoEditing,
		pictureEditing
	},
	setup ()
	{
		const firstConnection = true;

		return {
			user,
			firstConnection
		};
	}
});
</script>
