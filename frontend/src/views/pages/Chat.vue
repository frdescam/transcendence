<template>
	<q-page class="row no-wrap justify-between items-stretch content-stretch">
		<div class="col-3 channel">
			<channelChannel
				@channel-is-selected="(id) => selectedChannel = Number(id)"
			></channelChannel>
		</div>
		<div class="col-6 chat">
			<chatChannel></chatChannel>
		</div>
		<div class="col-3 user">
			<userChannel></userChannel>
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
		return {
			selectedChannel
		};
	}
});
</script>
