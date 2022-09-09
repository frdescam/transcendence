<template>
	<q-page class="row no-wrap justify-between items-stretch content-stretch">
		<div class="col-3 channel">
			<channelChannel
				:userId="user"
				@channel-is-selected="channelChanged"
				@channel-user-update="channelUpdate"
				@channel-ban-mute="mutBanChannel"
			></channelChannel>
		</div>
		<div class="col-6 chat">
			<chatChannel
				:selectedChannelBanMut="selectedChannelBanMut"
				:selectedChannel="selectedChannel"
				:blockedUser="blockedUser"
				:userUpdate="userUpdate"
				:userId="user"
			></chatChannel>
		</div>
		<div class="col-3 user">
			<userChannel
				:selectedChannelBanMut="selectedChannelBanMut"
				:selectedChannel="selectedChannel"
				:blockedUser="blockedUser"
				:userId="user"
			></userChannel>
		</div>
	</q-page>
	<q-dialog
		ref="dialog"
		no-esc-dismiss
		no-backdrop-dismiss
		position="bottom"
		square
	>
    <q-card style="width: 350px">
      <q-card-section class="row items-center justify-evenly no-wrap">
        <q-spinner-radio color="teal-7" size="3em" />
				<span class="dialog-socket-error">{{ $t('chat.socket') }}</span>
       </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QDialog, useMeta } from 'quasar';
import { Socket } from 'socket.io-client';
import { useI18n } from 'vue-i18n';
import { Capitalize } from 'src/boot/libs';
import { defineComponent, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { generateMeta } from 'src/meta';
import channelChannel from 'src/components/chat/Channel.vue';
import userChannel from 'src/components/chat/User.vue';
import chatChannel from 'src/components/chat/Chat.vue';

interface channelMutBan {
	user: number,
	channel: number,
	ban: boolean|null,
	mute: boolean|null
}

interface channelInterface {
	id: number,
	socketId: string,
	isDeleted: boolean
}

interface userUpdateInterface {
	type: string,
	user: number,
	value: boolean
}

export default defineComponent({
	name: 'chatPage',
	components: {
		channelChannel,
		userChannel,
		chatChannel
	},
	setup ()
	{
		// #region Set custom title
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const { t } = useI18n();

		useMeta(generateMeta(capitalize(t('chat.title'))));
		// #endregion Set custom title

		// #region Definition
		const socket: Socket = inject('socketChat') as Socket;

		const selectedChannel = ref<channelInterface>({
			id: 0,
			socketId: '',
			isDeleted: false
		});
		const selectedChannelBanMut = ref<channelMutBan>({
			user: 0,
			channel: 0,
			ban: null,
			mute: null
		});
		const userUpdate = ref<userUpdateInterface>({
			type: 'undefined',
			user: -1,
			value: false
		});
		const user = ref(0);
		const blockedUser = ref<number[]>([]);

		const mutBanChannel = (ret: channelMutBan) =>
		{
			selectedChannelBanMut.value = ret;
		};
		const channelChanged = (ret: channelInterface) =>
		{
			selectedChannel.value = ret;
		};
		const channelUpdate = (ret: userUpdateInterface) =>
		{
			userUpdate.value = ret;
		};
		// #endregion Definition

		// #region Blocked user
		watch(() => user.value, () => socket.emit('blocked::get', user.value));

		socket.on('blocked::receive::get', (ret) =>
		{
			if (!ret || ret.socketId !== socket.id)
				return;
			blockedUser.value.length = 0;
			if (ret.data.length)
			{
				for (const el of ret.data)
					blockedUser.value.push(el.target.id);
			}
		});

		socket.on('blocked::receive::add', (ret) =>
		{
			if (!ret || ret.data.user.id !== user.value)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'alreadyBlocked'))
				return;
			blockedUser.value.push(ret.data.target.id);
		});

		socket.on('blocked::receive::remove', (ret) =>
		{
			if (!ret || ret.data.user.id !== user.value)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'notBlocked') || ret.data.deleted === false)
				return;
			const i = blockedUser.value.indexOf(ret.data.target.id);
			if (i !== -1)
				blockedUser.value.splice(i, 1);
		});
		// #endregion

		// #region Check if error with socket
		const dialog = ref<QDialog | null>(null);

		const connectError = () => dialog.value?.show();
		const connect = () => dialog.value?.hide();
		const disconnect = (reason: Socket.DisconnectReason) =>
		{
			if (reason === 'io server disconnect')
				socket.connect();
		};

		onMounted(() =>
		{
			socket.on('connect_error', connectError);
			socket.on('connect', connect);
			socket.on('disconnect', disconnect);
			socket.connect();
			socket.emit('ping');
		});

		onUnmounted(() =>
		{
			socket.off('connect_error', connectError);
			socket.off('connect', connect);
			socket.off('disconnect', disconnect);
			socket.removeAllListeners();
			socket.disconnect();
		});
		// #endregion  Check if error with socket

		// #region Get user id
		socket.on('pong', (ret) =>
		{
			if (ret.socketId === socket.id)
				user.value = ret.id;
		});
		// #endregion Get user id

		return {
			selectedChannel,
			selectedChannelBanMut,
			user,
			userUpdate,
			blockedUser,

			dialog,

			mutBanChannel,
			channelChanged,
			channelUpdate
		};
	}
});
</script>

<style>
	.dialog-socket-error {
		font-size: large;
		width: 75%;
		text-align: center;
	}
</style>
