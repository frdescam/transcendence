<template>
	<div class="text-h6">
		<span id="username-display">
			{{ pseudo }}
			<q-btn @click="toggleNameEdit" flat round icon="edit" />
		</span>
		<span id="username-edit" style="display:none;">
			<q-form @submit="editUsername">
				<q-input style="display:inline;" v-model="newPseudo" label="Change pseudo"/>
				<q-btn type="submit" flat round icon="check_circle" />
				<q-btn @click="toggleNameEdit" flat round icon="cancel" />
			</q-form>
		</span>
	</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { api } from 'boot/axios';

export default defineComponent({
	props: [
		'pseudo'
	],
	emits: [
		'update:pseudo'
	],
	setup (props, { emit })
	{
		const newPseudo = ref('');
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
			toggleNameEdit();
			api.patch('/user/updatePseudo', { update_pseudo: newPseudo.value }).then((res) =>
			{
				emit('update:pseudo', res.data.pseudo);
			});
		};
		return {
			props,
			newPseudo,

			toggleNameEdit,
			editUsername
		};
	}
});
</script>
