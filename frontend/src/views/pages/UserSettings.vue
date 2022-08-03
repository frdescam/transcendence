<template>
	<q-page class="row items-start">
		<pictureAndPseudoEditing
			:username='username'
			:picture='profilePicture'
		></pictureAndPseudoEditing>
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">Password</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<q-form
					method="post"
					@submit="passwordSubmit"
				>
					<q-input
						v-model="oldPassword"
						outlined
						label="Current Password"
						name="password"
						:type="isOldPswd ? 'password' : 'text'"
						class=""
						:rules="[(val) => !!val || 'Field is required']"
						ref="inputRef"
					>
						<template v-slot:append>
							<q-icon
								:name="isOldPswd ? 'visibility_off' : 'visibility'"
								class="cursor-pointer"
								@click="isOldPswd = !isOldPswd"
							/>
						</template>
					</q-input>
					<q-input
						v-model="newPassword"
						outlined
						label="New Password"
						name="password"
						:type="isNewPswd ? 'password' : 'text'"
						class=""
						:rules="[(val) => !!val || 'Field is required']"
						ref="inputRef"
					>
						<template v-slot:append>
							<q-icon
								:name="isNewPswd ? 'visibility_off' : 'visibility'"
								class="cursor-pointer"
								@click="isNewPswd = !isNewPswd"
							/>
						</template>
					</q-input>
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
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
					@submit="TFASubmit"
				>
					<q-toggle
						v-model="use2FA"
						label="Activate?"
					/>
					<br/>
					<div v-if="use2FA">
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
import pictureAndPseudoEditing from 'src/components/userSettings/pictureAndPseudoEditing.vue';

export default ({
	name: 'IndexPage',
	components: {
		pictureAndPseudoEditing
	},
	setup ()
	{
		const username = ref('pohl');
		const profilePicture = ref('https://placeimg.com/500/300/nature');
		const newPassword = ref('');
		const oldPassword = ref('');
		const use2FA = ref(false);
		const paddleSelected = ref('Normal');

		return {
			username,
			profilePicture,
			oldPassword,
			newPassword,
			isOldPswd: ref(true),
			isNewPswd: ref(true),
			paddleSelected,
			use2FA,
			GameOptionsSubmit ()
			{
				console.log(paddleSelected.value);
			},
			TFASubmit ()
			{
				console.log(use2FA.value);
			},
			passwordSubmit ()
			{
				console.log(oldPassword.value, newPassword.value);
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
