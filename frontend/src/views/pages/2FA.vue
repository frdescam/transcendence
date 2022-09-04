<template>
  <q-card style="width: 300px; height: 200px" class="justify-center items-center">
    <q-form class="column justify-evenly items-center full-height">
      <q-input @update:model-value="update" :disable="disableInput" :color="inputColor" :autofocus=true mask="######" :label="capitalize($t('twofa.label'))"></q-input>
    </q-form>
  </q-card>
</template>

<script lang="ts">

import { AxiosInstance } from 'axios';
import { inject, ref } from 'vue';
import { Capitalize } from 'src/boot/libs';
import { useRouter } from 'vue-router';

export default ({
	name: '2FAPage',

	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		const router = useRouter();
		const disableInput = ref(false);
		const inputColor = ref('blue');

		async function update (code: string)
		{
			if (code.length === 6)
			{
				disableInput.value = true;
				const res = await api.post('/2FA/login', { code });
				if (res.data.error)
				{
					disableInput.value = false;
					inputColor.value = 'red';
				}
				else
					router.push({ name: 'logging' });
			}
		}

		return {
			capitalize,

			disableInput,
			inputColor,

			update
		};
	}
});
</script>
