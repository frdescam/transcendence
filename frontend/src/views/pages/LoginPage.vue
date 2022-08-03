<template>
  <q-page class="row items-center justify-center">
    <q-btn label="Login with" class="q-pa-md shadow-box" color="secondary">
      <q-icon
        class="q-ml-sm"
        name="img:https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg"
      />
    </q-btn>
  </q-page>
</template>

<script lang="ts">
// Whatever happens under here hasn't been tested and probably doesn't work,
// But it is meant to prepare the work pohl will be doing with Leo.

import { api } from 'boot/axios';
import { onMounted } from 'vue';

export default {
	name: 'LoginPage',
	setup ()
	{
		async function login ()
		{
			const result = await api.get('/login');
			return result.data;
		}

		onMounted(() =>
		{
			login();
		});

		return {
		};
	}
};
</script>
