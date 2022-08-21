<template>
	<q-page class="row items-start">
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
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">Password</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<passwordEditing></passwordEditing>
			</q-card-section>
		</q-card>

		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">Two factor authentication</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<q-form
					method="post"
					@submit="tfaSubmit"
				>
					<q-toggle
						v-model='useTfa'
						label="Activate?"
					/>
					<br/>
					<div v-if="useTfa">
						<p>Actions to enable 2FA</p>
					</div>
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
			</q-card-section>
		</q-card>

		<q-card bordered style='width: 300px;' class="my-card q-ma-md">
			<q-card-section>
				<div class="text-h6">Game options</div>
			</q-card-section>

			<q-separator inset />

			<q-card-section>
				<q-form
					method="post"
					@submit="GameOptionsSubmit"
				>
					<q-select v-model="paddleSelected" :options="paddleOptions" label="Paddle Color" />
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
			</q-card-section>
		</q-card>

		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">Danger zone!</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<q-form
					method="post"
					@submit="TFASubmit"
				>
					<q-btn push label="Delete your account">
						<q-popup-proxy>
							<q-banner>
								<template v-slot:avatar>
									<q-icon name="warning" color="red" />
								</template>
								Are you sure? You will lose all progress.
								<q-btn @click="deleteAccount" color="red" class="q-ma-xs" label='Yes' />
							</q-banner>
						</q-popup-proxy>
					</q-btn>
				</q-form>
			</q-card-section>
		</q-card>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import passwordEditing from 'src/components/userSettings/passwordEditing.vue';

export default ({
	name: 'IndexPage',
	components: {
		pseudoEditing,
		pictureEditing,
		passwordEditing
	},
	setup ()
	{
		const username = ref('pohl');
		const profilePicture = ref('https://placeimg.com/500/300/nature');
		const useTfa = ref(false);
		const tfaSubmit = function ()
		{
			console.log(useTfa);
		};
		const paddleSelected = ref('Normal');

		return {
			username,
			profilePicture,
			paddleSelected,
			useTfa,
			tfaSubmit,
			GameOptionsSubmit ()
			{
				console.log(paddleSelected.value);
			},
			deleteAccount ()
			{
				console.log('User deleted their account');
			},
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			]
		};
	}
});
</script>
