<template>
<q-card bordered style='width: 300px;' class="q-ma-md">
	<q-card-section>
		<div class="text-h6">
			<span id="username-display">
				{{ username }}
				<q-btn @click="toggleNameEdit" flat round icon="edit" />
			</span>
			<span id="username-edit" style="display:none;">
				<q-form @submit="editUsername">
					<q-input style="display:inline;" v-model="newUsername" label="Change username" />
					<q-btn type="submit" flat round icon="check_circle" />
					<q-btn @click="toggleNameEdit" flat round icon="cancel" />
				</q-form>
			</span>
		</div>
	</q-card-section>
	<q-separator inset />
	<q-card-section>
		<q-form @submit="editProfilePicture">
			<q-img :src="picture" class="profile-picture">
				<div class="absolute-full text-subtitle2 flex flex-center profile-picture-edit">
					<q-file outlined bg-color="white" v-model="newProfilePicture" label="Change your picture"/>
				</div>
			</q-img>
			<q-btn type="submit" class="q-mt-md" label='Update' />
		</q-form>
	</q-card-section>
</q-card>
</template>

<script>
import { ref, defineComponent } from 'vue';

export default defineComponent({
	props: [
		'username',
		'picture'
	],
	setup (props)
	{
		const newUsername = ref('');
		const newProfilePicture = ref('');
		const toggleNameEdit = function ()
		{
			let element = document.getElementById('username-display');
			if (element)
			{
				if (element.style.display === 'none')
					element.style.display = 'inline-block';
				else
					element.style.display = 'none';
			}
			element = document.getElementById('username-edit');
			if (element)
			{
				if (element.style.display === 'none')
				{
					element.style.display = 'inline-block';
					element?.getElementsByTagName('input')[0]?.focus();
				}
				else
					element.style.display = 'none';
			}
		};
		const editUsername = function ()
		{
			console.log(newUsername.value);
		};
		const editProfilePicture = function ()
		{
			console.log(newProfilePicture.value);
		};
		return {
			props,
			newUsername,
			newProfilePicture,
			toggleNameEdit,
			editUsername,
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
