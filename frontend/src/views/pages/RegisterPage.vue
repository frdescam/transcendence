<template>
  <q-page class="row items-center justify-center">
    <q-form
      action="/api/register"
      method="post"
      @submit="onSubmit"
      class="dark q-pa-md shadow-box shadow-8"
      autofocus
    >
      <div class="q-ma-md">
        <h3>Welcome to pong</h3>
        <p>Register:</p>
      </div>
      <q-input
        name="username"
        v-model="username"
        outlined
        color="primary"
        label="Username"
        class="bg-blue-grey-1 q-ma-md"
        :rules="[(val) => !!val || 'Field is required']"
        ref="inputRef"
      />
      <q-input
        name="email"
        v-model="email"
        outlined
        color="primary"
        label="e-mail"
        class="bg-blue-grey-1 q-ma-md"
        :rules="[(val) => !!val || 'Field is required']"
        ref="inputRef"
      />
      <q-input
        v-model="password"
        outlined
        label="Password"
        name="password"
        :type="isPwd ? 'password' : 'text'"
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
        <q-btn label="Register" class="full-width" type="submit" color="primary" />
        <p class="q-my-sm"><b>Or</b></p>
        <q-btn label="Register with" class="full-width q-mb-sm" color="secondary">
          <q-icon
            class="q-ml-sm"
            name="img:https://42.fr/wp-content/uploads/2021/05/42-Final-sigle-seul.svg"
          />
        </q-btn>
        <p>
          Already have an account?
          <router-link :to="{ path: '/login' }">Login</router-link>
        </p>
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
	setup ()
	{
		const inputRef = ref(null);
		const password = ref('');
		const email = ref('');
		const username = ref('');
		return {
			inputRef,
			password,
			email,
			username,
			isPwd: ref(true),
			onSubmit ()
			{
				console.log(username, password);
			}
		};
	}
};
</script>
