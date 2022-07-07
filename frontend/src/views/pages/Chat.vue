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
				@channel-is-selected="(id) => selectedChannel = Number(id)"
			></channelChannel>
		</div>
		<div class="col-6 chat">
			<chatChannel
				:userId="user"
			></chatChannel>
		</div>
		<div class="col-3 user">
			<userChannel
				:userId="user"
			></userChannel>
		</div>
	</q-page>
</template>

<script lang="ts">
import channelChannel from 'src/components/chat/Channel.vue';
import userChannel from 'src/components/chat/User.vue';
import chatChannel from 'src/components/chat/Chat.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
	name: 'chatPage',
	components: {
		channelChannel,
		userChannel,
		chatChannel
	},
	setup ()
	{
		const selectedChannel = ref(0);
		const user = ref(1);
		return {
			selectedChannel,
			user
		};
	}
});
</script>
