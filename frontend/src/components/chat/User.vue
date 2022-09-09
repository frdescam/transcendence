<template>
	<div style="max-width: 100%;">
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
						clickable
						v-ripple
						@click="openUserProfile"
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
					:disable="userIsBlocked"
					@click="sendMP(); mpMemu?.hide();"
				>
					<q-item-section avatar>
						<q-icon name="send"></q-icon>
					</q-item-section>
					<q-item-section>{{ $t('chat.user.sendMessage') }}</q-item-section>
				</q-item>

				<q-item
					clickable
					@click="blocked(); mpMemu?.hide();"
				>
					<q-item-section avatar>
						<q-icon v-if="!userIsBlocked" name="person_add" />
						<q-icon v-else name="person_remove" />
					</q-item-section>
					<q-item-section v-if="!userIsBlocked">{{ $t('chat.user.block') }}</q-item-section>
					<q-item-section v-else>{{ $t('chat.user.unblock') }}</q-item-section>
				</q-item>

				<q-item
					clickable
					:disable="!userIsConnected"
					@click="sendInvitation()"
				>
					<q-item-section avatar>
						<q-icon name="videogame_asset"></q-icon>
					</q-item-section>
					<q-item-section>{{ $t('chat.user.invite') }}</q-item-section>
				</q-item>
			</q-list>
		</q-menu>
	</div>
	<invitation-creator
		:dialogInvitationCreatorShow="dialogInvitationCreatorShow"
		:creatorId="userId"
		:creatorName="dialogCreatorName"
		:invitationId="dialogInvitationId"
		:invitationName="dialogInvitationName"
		@dialog-invitation-close="dialogInvitationCreatorShow = false"
	/>
	<invitation-user
		:userId="userId"
	/>
	<dialog-profile
		:user="dialogProfilUser"
		:dialogProfilShow="dialogProfilShow"
		@dialog-profil-close="dialogProfilShow = false"
	/>
</template>

<script lang="ts">
import { QMenu } from 'quasar';
import { Socket } from 'socket.io-client';
import { defineComponent, onMounted, ref, inject, watch } from 'vue';

import InvitationCreator from './chatComponents/InvitationCreator.vue';
import InvitationUser from './chatComponents/InvitationUser.vue';
import DialogProfile from './chatComponents/DialogProfile.vue';

export default defineComponent({
	name: 'user_channel',
	props: [
		'selectedChannelBanMut',
		'selectedChannel',
		'blockedUser',
		'userId'
	],
	components: {
		InvitationCreator,
		InvitationUser,
		DialogProfile
	},
	setup (props)
	{
		const socket: Socket = inject('socketChat') as Socket;

		const loading = ref(false);
		const noError = ref(true);
		const users = ref();

		const mpMemu = ref<QMenu | null>(null);
		const userSelected = ref<number>(-1);
		const userIsBlocked = ref<boolean>(false);
		const userIsConnected = ref<boolean>(false);

		const dialogInvitationCreatorShow = ref(false);
		const dialogCreatorName = ref();
		const dialogInvitationId = ref(0);
		const dialogInvitationName = ref();
		const isMe = ref(false);

		const findIndex = (id: number) =>
		{
			for (const i in users.value)
			{
				if (users.value[i].id === id)
					return Number(i);
			}
			return -1;
		};

		const imageError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/no_avatar.png';
		};

		const reset = () =>
		{
			loading.value = false;
			noError.value = true;
			users.value = [];
		};

		// #region Channel
		let socketComingFromUserVue = false;
		const getData = () =>
		{
			socketComingFromUserVue = true;
			loading.value = true;
			socket.emit('channel::get', props.selectedChannel.id);
		};

		socket.on('channel::receive::delete', (ret) =>
		{
			if (ret.data.channel === props.selectedChannel.id)
				users.value = [];
		});

		socket.on('channel::receive::get', (ret) =>
		{
			if (!socketComingFromUserVue || ret.socketId !== socket.id)
				return;
			socketComingFromUserVue = false;
			loading.value = false;
			if (ret.data === undefined)
				reset();
			else
				users.value = ret.data.users;
		});
		// #endregion Channel

		// #region MP
		const checkIfInvitationFailed = (): boolean =>
		{
			for (const user of users.value)
			{
				if (user.id === userSelected.value)
					return (user.connected);
			}
			return false;
		};

		const sendInvitation = () =>
		{
			if (userIsConnected.value)
				dialogInvitationCreatorShow.value = true;
			mpMemu.value?.hide();
		};

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
					userIsBlocked.value = props.blockedUser.includes(userSelected.value);
					userIsConnected.value = checkIfInvitationFailed();
					const iCreator = findIndex(props.userId);
					const iInvite = findIndex(userSelected.value);
					if (iCreator !== -1)
						dialogCreatorName.value = users.value[iCreator].pseudo;
					if (iInvite !== -1)
					{
						dialogInvitationId.value = users.value[iInvite].id;
						dialogInvitationName.value = users.value[iInvite].pseudo;
					}
					return;
				}
			}
			userSelected.value = -1;
			mpMemu.value?.hide();
		};

		const sendMP = () =>
		{
			isMe.value = true;
			socket.emit('channel::get::mp', [props.userId, userSelected.value]);
		};

		socket.on('channel::receive::get::mp', (ret) =>
		{
			if (isMe.value === false)
				return;
			if (ret && ret.socketId === socket.id)
			{
				if (ret.data.exist === false)
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
			}
			isMe.value = false;
		});
		// #endregion

		// #region Blocked
		const blocked = () =>
		{
			if (props.blockedUser.includes(userSelected.value))
			{
				socket.emit('blocked::remove', {
					id: props.userId,
					blockedId: userSelected.value
				});
			}
			else
			{
				socket.emit('blocked::add', {
					id: props.userId,
					blockedId: userSelected.value
				});
			}
		};
		// #endregion Blocked

		// #region Users
		socket.on('channel::user::receive::add', (ret) =>
		{
			if (!users.value || !ret.data.added || ret.data.channel !== props.selectedChannel.id)
				return;
			users.value.push(ret.data.data);
		});

		socket.on('channel::user::receive::remove', (ret) =>
		{
			if (!users.value || !ret.data.deleted || ret.data.channel !== props.selectedChannel.id)
				return;
			const i = findIndex(ret.data.data.id);
			if (i !== -1)
				users.value.splice(i, 1);
		});
		// #endregion Users

		// #region Check user update
		watch(() => props.selectedChannelBanMut, () =>
		{
			if (props.userId === props.selectedChannelBanMut.user &&
				props.selectedChannel.id > 0 &&
				props.selectedChannel.id === props.selectedChannelBanMut.channel)
			{
				if (props.selectedChannelBanMut.ban !== null)
				{
					if (props.selectedChannelBanMut.ban === true)
						reset();
					else
					{
						noError.value = true;
						getData();
					}
				}
			}
		}, { deep: true });
		// #endregion Check user update

		// #region User profil
		const dialogProfilShow = ref(false);
		const dialogProfilUser = ref();

		const openUserProfile = (e: Event) =>
		{
			let target = e.target as HTMLElement;
			if (target)
			{
				while (target.classList && !target.classList.contains('q-item'))
					target = target.parentNode as HTMLElement;
				if (target.hasAttribute &&
						target.hasAttribute('data-id'))
				{
					userSelected.value = Number(target.getAttribute('data-id'));
					const i = findIndex(userSelected.value);
					if (i !== -1)
					{
						dialogProfilUser.value = users.value[i];
						dialogProfilShow.value = true;
					}
				}
			}
		};
		// #endregion

		onMounted(() =>
		{
			watch(() => props.selectedChannel, () =>
			{
				if (!props.selectedChannel.isDeleted)
					getData();
				else if (props.selectedChannel.id === -1)
					reset();
			});

			if (props.selectedChannel.id > 0)
				getData();
		});

		return {
			loading,
			noError,
			users,

			dialogInvitationCreatorShow,
			dialogCreatorName,
			dialogInvitationId,
			dialogInvitationName,

			mpMemu,
			userSelected,
			userIsBlocked,
			userIsConnected,
			sendInvitation,
			openMpMenu,
			sendMP,

			blocked,

			dialogProfilShow,
			dialogProfilUser,
			openUserProfile,

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
