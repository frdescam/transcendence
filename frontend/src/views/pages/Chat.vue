<template>
	{{ socketid }}
	<div>
		<q-radio v-model="user" :val="Number(1)">Clément user</q-radio>
		<q-radio v-model="user" :val="Number(3)">John user</q-radio>
		<q-radio v-model="user" :val="Number(4)">Titi user</q-radio>
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
				:userUpdate="userUpdate"
				:userId="user"
			></chatChannel>
		</div>
		<div class="col-3 user">
			<userChannel
				:selectedChannelBanMut="selectedChannelBanMut"
				:selectedChannel="selectedChannel"
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
import { defineComponent, ref, inject } from 'vue';

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

		const socketid = ref(socket.id);
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

		const user = ref(1);

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

		return {
			socketid,
			selectedChannel,
			selectedChannelBanMut,
			user,
			userUpdate,

			mutBanChannel,
			channelChanged,
			channelUpdate
		};
	}
});
</script>
