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
import { Socket } from 'socket.io-client';
import { defineComponent, onMounted, ref, inject, watch } from 'vue';

export default defineComponent({
	name: 'user_channel',
	props: [
		'selectedChannel',
		'userId'
	],
	setup (props)
	{
		const socket: Socket = inject('socketChat') as Socket;

		const loading = ref(true);
		const noError = ref(true);
		const users = ref();

		const imageError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		let socketComingFromUserVue = false;
		const getData = () =>
		{
			socketComingFromUserVue = true;
			socket.emit('channel::get', props.selectedChannel.id);
		};

		socket.on('channel::receive::get', async (ret) =>
		{
			if (!socketComingFromUserVue)
				return;
			if (ret.socketId !== socket.id)
			{
				loading.value = false;
				noError.value = false;
				return;
			}
			socketComingFromUserVue = false;
			loading.value = false;
			users.value = ret.data.users;
		});

		onMounted(() =>
		{
			watch(() => props.selectedChannel, () =>
			{
				if (!props.selectedChannel.isDeleted)
					getData();
			});

			if (props.selectedChannel.id > 0)
				getData();
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
