<template>
	<div class="row no-wrap justify-center items-center content-center form-center">
		<div class="q-pa-lg row g-gutter-md login-card" style="max-width: 400px">
			<q-card flat bordered class="my-card">
				<q-card-section>
					<q-img class="oauth-logo" src="/img/42_logo.svg" :ratio="1" fit="fill"/>
					<q-separator />
					<q-form class="q-gutter-md"
						@submit="onSubmit">
						<q-input
							filled
							v-model="username"
							label="Username"
							hint="42 username"
							lazy-rules
								:rules="[ val => val && val.length > 0 || 'Enter username']"
						/>
						<q-input
							v-model="password"
							filled :type="cachePassword ? 'password' : 'text'"
							hint="Password with toggle"
							lazy-rules
								:rules="[ val => val && val.length > 0 || 'Enter password']"
						>
							<template v-slot:append>
							<q-icon
								:name="cachePassword ? 'visibility_off' : 'visibility'"
								class="cursor-pointer"
								@click="cachePassword = !cachePassword"
							/>
							</template>
						</q-input>
						<div class="row justify-center">
							<q-btn label="Submit" type="submit" color="primary"/>
						</div>
					</q-form>
				</q-card-section>
			</q-card>
		</div>
	</div>
</template>

<script>
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
	setup() {
		const quasar = useQuasar();
		const username = ref(null);
		const password = ref(null);
		const cachePassword = ref(true);
		return {
			username,
			password,
			cachePassword,
			onSubmit () {
				if (!username.value || !password.value)
					return;
				console.log('hello', username.value, password.value);
				quasar.notify({
					message: 'test',
					timeout: 3000,
					position: 'top'
				})
				/*quasar.fullscreen.request()
				.then(() => console.log('fullscreen on'))
				.catch(() => console.error('fullscreen failed on the carpet'));*/
			}
		}
	}
});
</script>

<style>
	html {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}
	body, .form-center {
		height: inherit;
		background-image: url('../../assets/img/trianglify.png');
		background-repeat: no-repeat;
		background-size: cover;
	}
	.oauth-logo {
		-webkit-filter: invert(1);
		filter: invert(1);
	}
</style>
