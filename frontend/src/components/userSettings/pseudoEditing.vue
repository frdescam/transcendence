<template>
	<div class="text-h6">
		<span id="username-display">
			{{ pseudo }}
			<q-btn @click="toggleNameEdit" flat round icon="edit" />
			<div class="inline-block">
				<q-spinner v-if="LoadingPseudo"></q-spinner>
				<q-icon v-if="success" name="check_circle" color="green"></q-icon>
				<q-icon v-if="failure" name="error" color="red"></q-icon>
				<span v-if="failure" class="q-pl-sm" style="color: red; font-size: 0.6em">{{ errorMessage }}</span>
			</div>
		</span>
		<span id="username-edit" style="display:none;">
			<q-form @submit="editUsername">
				<q-input style="display:inline;" v-model="newPseudo" :label="capitalize($t('setting.profilPictureModal.pseudo'))"/>
				<q-btn type="submit" flat round icon="check_circle" />
				<q-btn @click="toggleNameEdit" flat round icon="cancel" />
			</q-form>
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { Capitalize } from 'src/boot/libs';
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
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		const newPseudo = ref('');
		const LoadingPseudo = ref(false);
		const success = ref(false);
		const failure = ref(false);
		const errorMessage = ref('');
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
			LoadingPseudo.value = true;
			api.patch('/user/updatePseudo', { update_pseudo: newPseudo.value }).then((res) =>
			{
				if (res.data.error)
				{
					failure.value = true;
					success.value = false;
					errorMessage.value = res.data.error;
				}
				else
				{
					emit('update:pseudo', res.data.pseudo);
					failure.value = false;
					success.value = true;
				}
				LoadingPseudo.value = false;
			});
		};
		return {
			props,
			newPseudo,
			LoadingPseudo,
			success,
			failure,
			errorMessage,

			capitalize,
			toggleNameEdit,
			editUsername
		};
	}
});
</script>
