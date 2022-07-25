<template>
	<q-page class="row items-start">
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-form
				method="post"
				@submit="editUsernameAndOrProfilePicture"
			>
				<q-card-section>
					<div class="text-h6">
						<span id="username-display">{{ currentUsername }}</span>
						<span id="username-edit" style="display:none;">
							<q-input v-model="newUsername" label="Change username" />
						</span>
						<q-btn @click="toggleNameEdit" flat round icon="edit" />
					</div>
				</q-card-section>
				<q-separator inset />
				<q-card-section>
					<q-img :src="oldProfilePicture" class="profile-picture">
						<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
							<q-file outlined bg-color="white" v-model="newProfilePicture" label="Change your picture"/>
						</div>
					</q-img>
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-card-section>
			</q-form>
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

function toggleInlineDisplay (id: string)
{
	const element = document.getElementById(id);

	if (element)
	{
		if (element.style.display === 'none')
			element.style.display = 'inline-block';
		else
			element.style.display = 'none';
	}
}

export default ({
	name: 'IndexPage',
	setup ()
	{
		const oldProfilePicture = ref('https://placeimg.com/500/300/nature');
		const newProfilePicture = ref(null);
		const currentUsername = ref('pohl');
		const newUsername = ref('');
		const newPassword = ref('');
		const oldPassword = ref('');
		const use2FA = ref(false);
		const paddleSelected = ref('Normal');

		return {
			oldProfilePicture,
			currentUsername,
			oldPassword,
			newPassword,
			isOldPswd: ref(true),
			isNewPswd: ref(true),
			newUsername,
			paddleSelected,
			use2FA,
			newProfilePicture,
			toggleNameEdit ()
			{
				const usernameInput = document.getElementById('username-edit')?.getElementsByTagName('input')[0];
				toggleInlineDisplay('username-display');
				toggleInlineDisplay('username-edit');
				usernameInput?.focus();
			},
			editUsernameAndOrProfilePicture ()
			{
				console.log(newUsername.value, newProfilePicture.value);
			},
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

<style lang="scss">
.profile-picture .profile-picture-edit {
  visibility: hidden;
  opacity: 0;
  transition: .5s;
}

.profile-picture:hover .profile-picture-edit {
  visibility: visible;
  opacity: 1;
  transition: .5s;
}
</style>
