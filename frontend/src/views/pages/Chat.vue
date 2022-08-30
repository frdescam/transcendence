<template>
	<div>
		<q-radio v-model="user" :val="Number(1)">Clément user</q-radio>
		<q-radio v-model="user" :val="Number(2)">John user</q-radio>
		<q-radio v-model="user" :val="Number(3)">Titi user</q-radio>
	</div>
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
</template>

<script lang="ts">
import channelChannel from 'src/components/chat/Channel.vue';
import userChannel from 'src/components/chat/User.vue';
import chatChannel from 'src/components/chat/Chat.vue';
import { Socket } from 'socket.io-client';
import { defineComponent, inject, onBeforeMount, ref, watch } from 'vue';

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

		// #region Check if error with socket
		socket.on('connect_error', () =>
		{
			console.log('erreur, au secours !');
		});
		// #endregion  Check if error with socket

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
			if (!ret || ret.socketId !== socket.id)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'alreadyBlocked'))
				return;
			blockedUser.value.push(ret.data.target.id);
		});

		socket.on('blocked::receive::remove', (ret) =>
		{
			if (!ret || ret.socketId !== socket.id)
				return;
			if (Object.prototype.hasOwnProperty.call(ret.data, 'notBlocked') || ret.data.deleted === false)
				return;
			const i = blockedUser.value.indexOf(ret.data.target.id);
			if (i !== -1)
				blockedUser.value.splice(i, 1);
		});
		// #endregion

		// #region Get user id
		onBeforeMount(() => socket.emit('ping'));
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

			mutBanChannel,
			channelChanged,
			channelUpdate
		};
	}
});
</script>
