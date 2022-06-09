<template>
  <q-page class="row items-center justify-center">
    <q-form
      action="/api/login"
      method="post"
      @submit="onSubmit"
      class="dark q-pa-md shadow-box shadow-8"
      autofocus
    >
      <div class="q-ma-md">
        <h3>Welcome to pong</h3>
        <p>Login:</p>
      </div>
      <q-input
        name="username"
        v-model="username"
        outlined
        color="primary"
        label="Username or e-mail"
        class="bg-blue-grey-1 q-ma-md"
        :rules="[(val) => !!val || 'Field is required']"
        ref="inputRef"
      />
      <q-input
        v-model="password"
        outlined
        label="Password"
        name="password"
        :type="isPwd ? 'password' : 'visiblePassword'"
        class="bg-blue-grey-1 q-ma-md"
        :rules="[(val) => !!val || 'Field is required']"
        ref="inputRef"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <div class="q-ma-md">
        <q-btn label="Login" class="full-width" type="submit" color="primary" />
        <hr />
        <q-btn label="Login with" class="full-width q-mb-sm" color="secondary">
          <q-icon
            class="q-ml-sm"
            name="img:https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg"
          />
        </q-btn>
        <p>
          Need an account?
          <router-link :to="{ path: '/register' }">Register</router-link>
        </p>
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
	setup ()
	{
		const inputRef = ref(null);
		const password = ref('');
		const visiblePassword = ref('');
		const username = ref('');
		return {
			inputRef,
			password,
			username,
			visiblePassword,
			isPwd: ref(true),
			onSubmit ()
			{
				console.log(username, password);
			}
		};
	}
};
</script>
