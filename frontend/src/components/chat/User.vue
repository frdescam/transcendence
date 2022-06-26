<template>
	<div class="q-pa-md" style="max-width: 100%;">
		<q-list>
			<template v-if="loading">
				<q-item clickable v-ripple>
					<q-item-section>
						<q-skeleton type="text" />
					</q-item-section>
					<q-item-section avatar>
						<q-skeleton type="QAvatar" />
					</q-item-section>
				</q-item>
			</template>
			<template v-else>
				<template v-if="noError">
					<q-item clickable v-ripple v-for="user in users" v-bind:key="user.id">
						<q-item-section>{{ user.pseudo }}</q-item-section>
						<q-item-section avatar class="avatar">
							<q-avatar>
								<img :src="user.avatar" v-on:error="imageError"/>
							</q-avatar>
							<span class="connection-indicator" v-bind:class="(user.connected) ? 'connected' : ''"></span>
						</q-item-section>
					</q-item>
				</template>
				<template v-else>
					<q-item v-ripple class="full-width row no-wrap justify-center">
						<q-icon size="xl" name="cloud_off"></q-icon>
					</q-item>
				</template>
			</template>
		</q-list>
	</div>
</template>

<script lang="ts">
import { AxiosInstance } from 'axios';
import { TypeOfObject } from 'src/boot/typeofData';
import { defineComponent, onMounted, ref, inject } from 'vue';

export default defineComponent({
	name: 'user_channel',
	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const typeofObject: TypeOfObject = inject('typeofObject') as TypeOfObject;

		const loading = ref(true);
		const noError = ref(true);
		const users = ref();

		const imageError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		const getData = (id: number) =>
		{
			api.get(`/chat/channel/get/${id}`)
				.then(async (res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					loading.value = false;
					users.value = res.data.channel.users;
				})
				.catch(() =>
				{
					loading.value = false;
					noError.value = false;
				});
		};

		onMounted(() =>
		{
			window.addEventListener('chatChannelSelected', (e: Event) =>
			{
				const detail = (e as CustomEvent).detail;
				console.log('user.vue', detail);
				getData(detail.channelId);
			});
			const channelId = Number(localStorage.getItem('chat::channel::id'));
			if (channelId)
				getData(channelId);
		});

		return {
			loading,
			noError,
			users,
			imageError
		};
	}
});
</script>

<style>
	.avatar {
		position: relative;
	}
	.connection-indicator {
		position: absolute;
		height: 1em;
		width: 1em;
		background-color: #ff4a4a;
		bottom: -.2em;
		right: -.2em;
		border-radius: 50%;
	}
	.connection-indicator.connected {
		background-color: #1aca32 !important;
	}
</style>
