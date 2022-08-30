<template>
  <q-page class="column items-center justify-center" style="background-image: url(/background.png); background-position: center; background-size: cover; background-repeat: no-repeat;">
    <q-btn label="Login with" class="q-pa-md shadow-box" color="secondary" href="http://127.0.0.1:8080/api/login">
      <q-icon
        class="q-ml-sm"
        name="img:https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg"
      />
    </q-btn>
	<div class="q-mt-lg" style="color: white;">Or login as test user : </div>
	<q-form @submit="onSubmit" class="column justify-evenly items-center full-height">
		<q-input v-model="id" class="q-my-lg" color="white" :autofocus=true label="enter id :"></q-input>
		<q-btn label="Submit" type="submit" color="secondary"/>
	</q-form>
  </q-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';

export default {
	name: 'LoginPage',

	setup ()
	{
		const id = ref(null);

		async function onSubmit ()
		{
			api.post('/auto_login',
				{
					id: id.value
				});
		}
		return {
			onSubmit,

			id
		};
	}
};
</script>
