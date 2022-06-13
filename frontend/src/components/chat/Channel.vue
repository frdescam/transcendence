<template>
	<ul>
	</ul>
</template>

<script lang="ts">
import { api } from 'boot/axios';
import { defineComponent } from 'vue';

interface _chanel {
	id: number,
	type: number,
	name: string,
	password: string,
	creationDate: Date
}
interface _ret {
	statusCode: number,
	message: string,
	channels: Array<{
		id: number,
		type: number,
		name: string,
		password: string,
		creationDate: Date
	}>
}

function printChannel ()
{
	api.get<_ret>('/chat/channel/get/1')
		.then((response) =>
		{
			for (const res of response.data.channel)
			{
				const _li = document.createElement('li');
				_li.innerText = `${res.id} > ${res.name}`;
				document.getElementsByTagName('ul')[0].appendChild(_li);
			}
		})
		.catch((err: unknown) =>
		{
			console.error(err);
		});
}

export default defineComponent({
	name: 'chat_channel',
	async data ()
	{
		const temp = await api.get<_ret>('/chat/channel/get/1');
		return {
			
		}
	},
	setup ()
	{
		console.log('setup', 'one');
		printChannel();
	}
});
</script>

<style>

</style>
