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
					<q-item
						clickable v-ripple
						v-for="user in users" v-bind:key="user.id" :data-id="user.id"
					>
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
		<q-menu
			ref="mpMemu"
			touch-position
			context-menu
			@before-show="openMpMenu"
		>
			<q-list bordered padding>
				<q-item
					clickable
					@click="sendMP(); mpMemu?.hide();"
				>
					<q-item-section avatar>
						<q-icon name="send"></q-icon>
					</q-item-section>
					<q-item-section>Send message</q-item-section>
				</q-item>
			</q-list>
		</q-menu>
	</div>
	<q-dialog
		ref="errorDialog"
		square
	>
    <q-card>
      <q-card-section>
        <div class="text-h6">Alert</div>
      </q-card-section>

      <q-card-section class="q-pt-none">toto</q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QDialog, QMenu } from 'quasar';
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

		const mpMemu = ref<QMenu | null>(null);
		const userSelected = ref<number>(-1);
		const errorDialog = ref<QDialog | null>(null);

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

		socket.on('channel::receive::get', (ret) =>
		{
			if (!socketComingFromUserVue || ret.socketId !== socket.id)
				return;
			socketComingFromUserVue = false;
			loading.value = false;
			users.value = ret.data.users;
		});

		// #region MP
		const openMpMenu = (e: Event) =>
		{
			let target = e.target as HTMLElement;
			if (target)
			{
				while (target.classList && !target.classList.contains('q-item'))
					target = target.parentNode as HTMLElement;
				if (target.hasAttribute &&
					target.hasAttribute('data-id') &&
					Number(target.getAttribute('data-id')) !== props.userId)
				{
					userSelected.value = Number(target.getAttribute('data-id'));
					return;
				}
			}
			userSelected.value = -1;
			mpMemu.value?.hide();
		};

		const sendMP = () =>
		{
			socket.emit('channel::get::mp', [props.userId, userSelected.value]);
			socket.on('channel::receive::get::mp', (ret) =>
			{
				if (ret && ret.data.exist === false)
				{
					socket.emit('channel::add', {
						id: null,
						creator: props.userId,
						name: null,
						type: 'direct',
						password: null,
						users: [
							props.userId,
							userSelected.value
						]
					});
				}
				else
					socket.emit('channel::change', ret.data.channel.id);
			});
		};
		// #endregion

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

			mpMemu,
			userSelected,
			errorDialog,
			openMpMenu,
			sendMP,

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
