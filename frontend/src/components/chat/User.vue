<template>
	<div class="q-pa-md" style="max-width: 100%;">
		<q-list>
			<template v-if="loading">
				<q-item clickable v-ripple>
					<q-item-section avatar>
						<q-skeleton type="QAvatar" />
					</q-item-section>
					<q-item-section>
						<q-skeleton type="text" />
					</q-item-section>
				</q-item>
			</template>
			<template v-else>
				<q-item clickable v-ripple v-for="user in users" v-bind:key="user.id">
					<q-item-section avatar>
						<q-avatar>
							<img src="" />
						</q-avatar>
					</q-item-section>
					<q-item-section>{{ user.name }}</q-item-section>
				</q-item>
			</template>
		</q-list>
	</div>
</template>

<script lang="ts">
import { api } from 'boot/axios';
import { defineComponent, onMounted, ref } from 'vue';

interface userInterface {
	id: number
}

export default defineComponent({
	name: 'user_channel',
	setup ()
	{
		const loading = ref(true);
		const noError = ref(true);
		const users = ref();

		onMounted(() =>
		{
			api.get('/user/all') // A adapater au channel
				.then((res) =>
				{
					console.log(res);
					loading.value = false;
					users.value = res.data.users;
				})
				.catch((err) =>
				{
					console.log(err);
					loading.value = false;
				});
		});

		return {
			loading,
			noError,
			users
		};
	}
});
</script>

<style>
</style>
