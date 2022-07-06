<template>
	<q-page class="row items-start">
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">
					<q-icon v-if="online" name="fiber_manual_record" color="green" />
					<q-icon v-else name="fiber_manual_record" color="red" />
					{{ currentUsername }}
				</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<q-form
					method="post"
					@submit="usernameSubmit"
				>
					<q-input v-model="newUsername" label="Change username" />
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
			</q-card-section>
		</q-card>

		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">Avatar</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<q-img :src="oldProfilePicture" />
				<q-separator inset class="q-my-sm"/>
				<q-form
					method="post"
					@submit="profilePictureSubmit"
				>
					<q-file v-model="newProfilePicture" label="Change your picture">
						<template v-slot:prepend>
							<q-icon name="attach_file" />
						</template>
					</q-file>
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
			</q-card-section>
		</q-card>

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

		<q-card bordered class="my-card q-ma-md">
			<q-card-section>
				<div class="text-h6">Game options</div>
			</q-card-section>

			<q-separator />

			<q-card-section>
				<q-form
					method="post"
					@submit="TFASubmit"
				>
					<q-select v-model="paddleSelected" :options="paddleOptions" label="Paddle Color" />
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
			</q-card-section>
		</q-card>

		<q-card bordered class="my-card q-ma-md">
			<q-card-section>
				<div class="text-h6">Score</div>
			</q-card-section>

			<q-separator />

			<q-card-section>
				<div class="text-p">Wins: {{ wins }} / Losses: {{ losses }}</div>
				<div class="text-p">Ratio: {{ Math.round(wins / losses * 10) / 10 }}</div>
			</q-card-section>
		</q-card>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';

export default ({
	name: 'IndexPage',
	setup ()
	{
		const oldProfilePicture = ref('https://placeimg.com/500/300/nature');
		const newProfilePicture = ref(null);
		const currentUsername = ref('gros nullos');
		const newUsername = ref('');
		const newPassword = ref('');
		const oldPassword = ref('');
		const use2FA = ref(false);

		return {
			oldProfilePicture,
			currentUsername,
			oldPassword,
			newPassword,
			isOldPswd: ref(true),
			isNewPswd: ref(true),
			newUsername,
			use2FA,
			newProfilePicture,
			usernameSubmit ()
			{
				console.log(newUsername);
			},
			profilePictureSubmit ()
			{
				console.log(newProfilePicture);
			},
			TFASubmit ()
			{
				console.log(use2FA);
			},
			passwordSubmit ()
			{
				console.log(oldPassword, newPassword);
			},
			deleteAccount ()
			{
				console.log("User deleted their account");
			},
			paddleSelected: ref('Normal'),
			online: ref(true),
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			],
			wins: ref(7),
			losses: ref(4)
		};
	}
});
</script>
