<template>
	<q-page class="row items-center justify-center" style="background-image: url(/background.png); background-position: center; background-size: cover; background-repeat: no-repeat;">
		<q-card style="width: 300px; height: 200px" class="justify-center items-center">
			<q-form class="column justify-evenly items-center full-height">
				<q-input @update:model-value="update" :disable="disableInput" mask="######" label="Enter 2FA code :" class="row justify-center"></q-input>
			</q-form>
		</q-card>
	</q-page>
</template>

<script lang="ts">

import { api } from 'boot/axios';
import { ref } from 'vue';

export default ({
	name: '2FAPage',

	setup ()
	{
		const disableInput = ref(false);

		async function update (code: string)
		{
			if (code.length === 6)
			{
				disableInput.value = true;
				const res = await api.post('/2FA/login', { code: code });
			}
		}

		return {
			disableInput,

			update
		};
	}
});
</script>
