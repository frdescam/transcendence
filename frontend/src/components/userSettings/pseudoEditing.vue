<template>
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
</template>

<script>
import { ref, defineComponent } from 'vue';

export default defineComponent({
	props: [
		'username'
	],
	setup (props)
	{
		const newUsername = ref('');
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
		return {
			props,
			newUsername,
			toggleNameEdit,
			editUsername
		};
	}
});
</script>
