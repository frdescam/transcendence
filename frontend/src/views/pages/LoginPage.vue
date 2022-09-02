<template>
	<q-card class="column items-center justify-center" style="width: 300px; height: 400px">
		<q-btn :label="$t('login.button')" class="q-pa-md shadow-box" color="secondary" href="http://127.0.0.1:8080/api/login">
			<q-icon
				class="q-ml-sm"
				name="img:https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg"
			/>
		</q-btn>
		<div class="q-mt-lg">Or login as test user : </div>
		<q-form @submit="onSubmit" class="column justify-evenly items-center">
			<q-input v-model="id" ref="input" class="q-my-lg" :disable="disableInput" :color="inputColor" :autofocus=true label="enter id :"></q-input>
			<q-btn
				:label="$t('login.submit')"
				type="submit"
				color="secondary"
			/>
		</q-form>
	</q-card>
</template>

<script lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useRouter } from 'vue-router';

export default {
	name: 'LoginPage',

	setup ()
	{
		const router = useRouter();
		const id = ref(null);
		const disableInput = ref(false);
		const inputColor = ref('blue');
		const input = ref();

		async function onSubmit ()
		{
			disableInput.value = true;
			api.post('/auto_login',
				{
					id: id.value
				})
				.then((res) =>
				{
					if (res.data.two_factor_enabled)
						router.push('/login/2FA');
					else
						router.push('/');
				}).catch(() =>
				{
					inputColor.value = 'red';
					disableInput.value = false;
					setTimeout(() =>
					{
						input.value.focus();
					}, 100);
				});
		}
		return {
			onSubmit,

			id,
			input,
			inputColor,
			disableInput
		};
	}
};
</script>
