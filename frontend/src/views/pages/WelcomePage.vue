<template>
	<q-page class="column items-center">
		<h3>Welcome to transcendence!</h3>
		<h5>You can edit you pseudo and profile picture right here:</h5>
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<pseudoEditing
					:username='username'
				></pseudoEditing>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<pictureEditing
					:picture='profilePicture'
				></pictureEditing>
			</q-card-section>
		</q-card>
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

		return {
			username,
			profilePicture
		};
	}
});
</script>
