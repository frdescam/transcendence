<template>
	<q-form @submit="editProfilePicture">
		<q-img v-if="!newUploadedAvatar" :src="avatar" class="profile-picture" style="min-height: 200px">
			<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
				<q-file
					max-file-size="5242880"
					accept="image/jpeg,image/png"
					outlined bg-color="white"
					v-model="newAvatar"
					@update:model-value="updateAvatarWithPickedOne"
					:label="capitalize($t('setting.profilPictureModal.picture'))"
				/>
			</div>
		</q-img>
		<q-img v-if="newUploadedAvatar" :src="newUploadedAvatar" class="profile-picture">
			<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
				<q-file
					max-file-size="5242880"
					accept="image/jpeg,image/png"
					outlined bg-color="white"
					v-model="newAvatar"
					@update:model-value="updateAvatarWithPickedOne"
					:label="capitalize($t('setting.profilPictureModal.picture'))"
				/>
			</div>
		</q-img>
		<div class="row items-center q-mt-md">
			<q-btn type="submit" :label="capitalize($t('setting.profilPictureModal.update'))" />
			<div class="q-pl-md">
				<q-spinner v-if="LoadingAvatar"></q-spinner>
				<q-icon v-if="success" name="check_circle" color="green"></q-icon>
				<q-icon v-if="failure" name="error" color="red"></q-icon>
				<span v-if="failure" class="q-pl-sm" style="color: red; font-size: 0.6em">{{ errorMessage }}</span>
			</div>
		</div>
	</q-form>
</template>

<script lang="ts">
import { inject, ref, defineComponent } from 'vue';
import { Capitalize } from 'src/boot/libs';
import { api } from 'boot/axios';
import type { RefreshUserState } from 'src/boot/state';

export default defineComponent({
	props: [
		'avatar'
	],
	setup (props)
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		const refreshUserState = inject('refreshUserState') as RefreshUserState;

		const newAvatar = ref(null);
		const newUploadedAvatar = ref(null);
		const success = ref(false);
		const failure = ref(false);
		const LoadingAvatar = ref(false);
		const errorMessage = ref('');
		function editProfilePicture ()
		{
			LoadingAvatar.value = true;
			const formData = new FormData();
			formData.append('file', newAvatar.value);
			api.post('/user/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}).then((res) =>
			{
				if (!res.data.avatar.endsWith('no_avatar.png'))
				{
					success.value = true;
					failure.value = false;
					refreshUserState();
				}
				else
				{
					failure.value = true;
					success.value = false;
				}
			}).catch(() =>
			{
				failure.value = true;
				success.value = false;
				errorMessage.value = 'Only image files (jpg, jpeg, png) are supported';
				newUploadedAvatar.value = null;
			});
			LoadingAvatar.value = false;
		}

		function updateAvatarWithPickedOne (value)
		{
			newUploadedAvatar.value = URL.createObjectURL(value);
		}

		return {
			props,
			newAvatar,
			newUploadedAvatar,
			success,
			failure,
			LoadingAvatar,
			errorMessage,

			capitalize,
			updateAvatarWithPickedOne,
			editProfilePicture
		};
	}
});
</script>

<style lang="scss" scoped>
.profile-picture
{
	min-height: 100px;
	max-height: 400px;
}
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
