<template>
	<q-page class="column items-center">
		<h3>Welcome to transcendence!</h3>
		<q-btn class="q-mb-md" :to="{ path: '/play' }" color="primary">Start a game</q-btn>
		<q-btn class="q-mb-md" :to="{ path: '/chat' }" color="primary">Chat with your friends</q-btn>
		<q-btn class="q-mb-md" :to="{ path: '/friends' }" color="primary">Manage your friends</q-btn>
		<q-btn class="q-mb-md" :to="{ path: '/leaderboard' }" color="primary">Checkout your score on the leaderboard
		</q-btn>
		<div v-if="firstConnection == true" class="column items-center">
			<h5 class="q-mb-md">You can edit you pseudo and profile picture right here:</h5>
			<q-card bordered style='width: 300px;' class="q-ma-md">
				<q-card-section>
					<pseudoEditing :username='username'></pseudoEditing>
				</q-card-section>
				<q-separator inset />
				<q-card-section>
					<pictureEditing :picture='profilePicture'></pictureEditing>
				</q-card-section>
			</q-card>
			<q-btn class="q-mb-xs" :to="{ path: '/settings' }" color="primary">Or edit the rest of your settings</q-btn>
		</div>
		<q-btn v-else class="q-mb-xs" :to="{ path: '/settings' }" color="primary">Edit your settings</q-btn>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';

export default ({
	name: 'WelcomePage',
	components: {
		pseudoEditing,
		pictureEditing
	},
	setup ()
	{
		const username = ref('pohl');
		const profilePicture = ref('https://placeimg.com/500/300/nature');
		const firstConnection = ref('true');

		return {
			username,
			profilePicture,
			firstConnection
		};
	}
});
</script>
