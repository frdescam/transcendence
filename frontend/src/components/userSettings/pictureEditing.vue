<template>
	<q-form @submit="editProfilePicture">
		<q-img :src="picture" class="profile-picture">
			<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
				<q-file outlined bg-color="white" v-model="newProfilePicture" label="Change your picture"/>
			</div>
		</q-img>
		<q-btn type="submit" class="q-mt-md" label='Update' />
	</q-form>
</template>

<script>
import { ref, defineComponent } from 'vue';

export default defineComponent({
	props: [
		'picture'
	],
	setup (props)
	{
		const newProfilePicture = ref('');
		const editProfilePicture = function ()
		{
			console.log(newProfilePicture.value);
		};
		return {
			props,
			newProfilePicture,
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
