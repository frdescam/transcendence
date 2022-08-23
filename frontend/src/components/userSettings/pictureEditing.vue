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
		<q-btn type="submit" class="q-mt-md" label='Update' />
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
		function editProfilePicture ()
		{
			const formData = new FormData();
			formData.append('file', newAvatar.value);
			api.post('/user/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
		}

		function updateAvatarWithPickedOne (value)
		{
			console.log(value);
			newUploadedAvatar.value = URL.createObjectURL(value);
			console.log(newUploadedAvatar.value);
		}

		return {
			props,
			newAvatar,
			newUploadedAvatar,

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
