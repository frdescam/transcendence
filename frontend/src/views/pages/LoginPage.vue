<template>
	<q-card class="column items-center justify-center connection-box">
		<q-btn :label="$t('login.button')" class="q-pa-md shadow-box" color="secondary" href="http://127.0.0.1:8080/api/login">
			<q-icon
				class="q-ml-sm"
				name="img:imgs/42_logo.svg"
			/>
		</q-btn>
		<template v-if="env.DEV === true && env.PROD === false">
			<div class="q-mt-lg">Or login as test user : </div>
			<q-form @submit="onSubmit" class="column justify-evenly items-center">
				<q-input v-model="id" ref="input" class="q-my-lg" :disable="disableInput" :color="inputColor" :autofocus=true label="enter id :"></q-input>
				<q-btn
					:label="$t('login.submit')"
					type="submit"
					color="secondary"
				/>
			</q-form>
		</template>
	</q-card>
</template>

<script lang="ts">
import { inject, ref } from 'vue';
import { AxiosInstance } from 'axios';
import { useRouter } from 'vue-router';
import type { catchAxiosType } from 'src/boot/axios';

export default {
	name: 'LoginPage',

	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const catchAxios = inject('catchAxios') as catchAxiosType;
		const router = useRouter();
		const id = ref(null);
		const disableInput = ref(false);
		const inputColor = ref('blue');
		const input = ref();
		const env = ref(import.meta.env);

		async function onSubmit ()
		{
			disableInput.value = true;
			catchAxios(
				api.post('/auto_login',
					{
						id: id.value
					})
					.then((res) =>
					{
						if (res.data.two_factor_enabled)
							router.push('/login/2FA');
						else
							router.push({ name: 'logging' });
					}).catch(() =>
					{
						inputColor.value = 'red';
						disableInput.value = false;
						setTimeout(() =>
						{
							input.value.focus();
						}, 100);
					})
			);
		}
		return {
			onSubmit,

			id,
			input,
			inputColor,
			disableInput,
			env
		};
	}
};
</script>

<style scoped>
	.connection-box {
		padding: 3em;
		height: fit-content;
		width: fit-content;
	}
</style>
