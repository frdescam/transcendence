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
				<template v-if="noError">
					<q-item clickable v-ripple v-for="channel in channels" v-bind:key="channel.id">
						<q-item-section avatar>
							<div class="channel-avatar" :style="{ backgroundColor: `${randomColor()}` }">
								<span>{{ channel.name.slice(0, 2).toUpperCase() }}</span>
							</div>
						</q-item-section>
						<q-item-section>{{ channel.name }}</q-item-section>
					</q-item>
				</template>
				<template v-else>
					<q-item clickable v-ripple>
						<q-item-section avatar>
							<q-icon name="cloud_off"></q-icon>
						</q-item-section>
						<q-item-section>Error</q-item-section>
					</q-item>
				</template>
			</template>
		</q-list>
	</div>
</template>

<script lang="ts">
import { api } from 'boot/axios';
import { typeofObject } from 'src/boot/typeofData';
import { defineComponent, onMounted, ref } from 'vue';

interface channelInterface {
	id: number,
	type: number,
	name: string,
	password: string,
	creationDate: Date
}
interface retInterface {
	statusCode: number,
	message: string,
	channels: Array<channelInterface>
}

export default defineComponent({
	name: 'chat_channel',
	setup ()
	{
		const loading = ref(true);
		const noError = ref(true);
		const channels = ref(new Array<channelInterface>()); // eslint-disable-line no-array-constructor
		const randomColor = () =>
		{
			const __colors = ['#ffc93c', '#ff9a3c', '#ff6f3c', '#49beb7', '#35bcbf', '#c5d86d'];
			return __colors[Math.floor(Math.random() * __colors.length)];
		};

		onMounted(() =>
		{
			api.get<retInterface>('/chat/channel/get')
				.then((res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					loading.value = false;
					channels.value = res.data.channels;
				})
				.catch(() =>
				{
					loading.value = false;
					noError.value = false;
				});
		});
		return {
			loading,
			noError,
			channels,
			randomColor
		};
	}
});
</script>

<style>
.no-padding {
	padding-right: 2px;
}
.channel-avatar {
	position: relative;
	width: 50px;
	height: 50px;
	border-radius: 50%;
}
.channel-avatar > span {
	color: #fff;
	position: absolute;
	width: 31px;
	top: 10px;
	left: 10px;
	font-size: 1.5em;
	text-align: center;
}
</style>
