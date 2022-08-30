<template>
	<q-form @submit="editProfilePicture">
		<q-img v-if="!newUploadedAvatar" :src="avatar" class="profile-picture">
			<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
				<q-file outlined bg-color="white" v-model="newAvatar" @update:model-value="updateAvatarWithPickedOne" label="Change your picture"/>
			</div>
		</q-img>
		<q-img v-if="newUploadedAvatar" :src="newUploadedAvatar" class="profile-picture">
			<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
				<q-file outlined bg-color="white" v-model="newAvatar" @update:model-value="updateAvatarWithPickedOne" label="Change your picture"/>
			</div>
		</q-img>
		<div class="row items-center q-mt-md">
			<q-btn type="submit" label='Update'/>
			<div class="q-pl-md">
				<q-spinner v-if="LoadingAvatar"></q-spinner>
				<q-icon v-if="success" name="check_circle" color="green"></q-icon>
				<q-icon v-if="failure" name="error" color="red"></q-icon>
				<span v-if="failure" class="q-pl-sm" style="color: red; font-size: 0.6em">{{ errorMessage }}</span>
			</div>
		</div>
	</q-form>
</template>

<script>
import { ref, defineComponent } from 'vue';
import { api } from 'boot/axios';

export default defineComponent({
	props: [
		'avatar'
	],
	setup (props)
	{
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
				if (res.data.avatar !== 'http://127.0.0.1:8080/public/no_avatar.png')
				{
					success.value = true;
					failure.value = false;
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

			updateAvatarWithPickedOne,
			editProfilePicture
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
