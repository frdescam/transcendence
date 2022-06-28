<template>
	<form
		autocorrect="off"
		autocapitalize="off"
		autocomplete="off"
		spellcheck="true"
	>
		<q-editor
			:placeholder="$t('chat.editor.placeholder')"
			ref="editorRef"
			max-height="15em"
			:definitions="{
				image: {
					icon: 'image',
					tip: $t('chat.editor.image'),
					handler: insertImage
				},
				send: {
					icon: 'send',
					tip: $t('chat.editor.send'),
					handler: sendMessage
				}
			}"
			:toolbar="[
				['bold', 'italic', 'strike', 'underline'],
				['undo', 'redo'],
				['image', 'send']
			]"
			v-model="editor"
		/>
	</form>
	<template v-if="loading">
		<div class="message-list">
			<q-chat-message
				avatar="imgs/chat/default.webp"
				sent
				text-color="white"
				bg-color="primary"
			>
				<q-skeleton type="text" width="150px" />
			</q-chat-message>
			<q-chat-message
				avatar="imgs/chat/default.webp"
				bg-color="amber"
			>
				<q-skeleton type="text" width="150px" />
			</q-chat-message>
		</div>
	</template>
	<template v-else>
		<div class="message-list" ref="chat">
			<template
				v-for="message in messages"
				v-bind:key="message.id"
			>
				<q-chat-message
					:name="(userId !== message.user.id) ? message.user.pseudo: $t('chat.message.me')"
					:avatar="message.user.avatar"
					:stamp="generateTimestamp(message.messages[message.messages.length - 1].timestamp)"
					:sent="userId === message.user.id"
					:text-html="true"
					:text="message.messages.map((x: any) => x.content)"
					text-color="white"
					:bg-color="(userId === message.user.id) ? 'cyan-8' : 'blue-8'"
				></q-chat-message>
			</template>
		</div>
	</template>
</template>

<script lang="ts">
import { AxiosInstance } from 'axios';
import { TypeOfObject } from 'src/boot/typeofData';
import { io } from 'socket.io-client';
import { defineComponent, onMounted, ref, inject, nextTick } from 'vue';

interface arrayInterface {
	id: number,
	content: string,
	timestamp: Date,
	modified: Date
}

interface messageInterface {
	user: {
		id: number,
		pseudo: string,
		avatar: string,
		connected: boolean
	},
	messages: arrayInterface[]
}

export default defineComponent({
	name: 'chat_channel',
	setup ()
	{
		const socket = io('http://localhost:8080/chat::');
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const typeofObject: TypeOfObject = inject('typeofObject') as TypeOfObject;

		const chat = ref<HTMLDivElement | null>(null);
		const loading = ref(true);
		const noError = ref(true);
		const editor = ref('');
		const messages = ref(new Array<messageInterface>()); // eslint-disable-line no-array-constructor
		const userId = ref(1); // A changer avec le vrai id de l'utilisateur

		const getBottomOfChat = () =>
		{
			nextTick(() =>
			{
				if (chat.value)
					chat.value.scrollTop = chat.value.scrollHeight;
			});
		};
		const calcHash = async (str: string) =>
		{
			const Uint8 = new TextEncoder().encode(str);
			const hash = await crypto.subtle.digest('SHA-256', Uint8);
			const hashArr = Array.from(new Uint8Array(hash));
			return hashArr.map((el) => el.toString(16).padStart(2, '0')).join('');
		};
		const insertImage = () =>
		{
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.png, .jpg';
			let file;
			input.onchange = () =>
			{
				const files = Array.from(input.files as FileList);
				file = files[0];
				const reader = new FileReader();
				let dataUrl:string;
				reader.onloadend = () =>
				{
					dataUrl = String(reader.result);
					editor.value += `<img src="${dataUrl}" />`;
				};
				reader.readAsDataURL(file);
			};
			input.click();
		};
		const sendMessage = async () =>
		{
			if (editor.value.length <= 0)
				return;
			socket.emit('add', {
				id: userId.value,
				channel: localStorage.getItem('chat::channel::id'),
				message: editor.value,
				length: editor.value.length,
				timestamp: Date.now(),
				hash: await calcHash(editor.value)
			});
			editor.value = '';
		};
		const generateTimestamp = (timestamp: Date) =>
		{
			const messageDate = new Date(timestamp);
			const currentDate = new Date();
			if ((currentDate.getTime() - messageDate.getTime()) / 86400000 < 1.0) // one day
				return `${messageDate.getDay()}/${messageDate.getMonth()}/${messageDate.getFullYear()} ${messageDate.getHours()}h${messageDate.getMinutes()}`;
			else
				return `${messageDate.getDay()}/${messageDate.getMonth()}/${messageDate.getFullYear()}`;
		};
		const getMessages = (channelId: string) =>
		{
			api.get(`/chat/message/get/${channelId}`)
				.then((res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					loading.value = false;
					const temp: messageInterface = {
						user: {
							id: 0,
							pseudo: '',
							avatar: '',
							connected: false
						},
						messages: []
					};
					let currentUser = 0;

					for (const message of res.data.messages)
					{
						if (!currentUser ||
							(currentUser && currentUser !== message.creator.id))
						{
							if (temp.messages.length > 0)
								messages.value.push(JSON.parse(JSON.stringify(temp)));
							currentUser = Number(message.creator.id);
							temp.user.avatar = String(message.creator.avatar);
							temp.user.connected = Boolean(message.creator.connected);
							temp.user.id = Number(message.creator.id);
							temp.user.pseudo = String(message.creator.pseudo);
							temp.messages.length = 0;
						}
						temp.messages.push({
							id: Number(message.id),
							content: String(message.content),
							timestamp: message.timestamp,
							modified: message.modified
						});
					}
					if (temp.messages.length > 0)
						messages.value.push(JSON.parse(JSON.stringify(temp)));
					getBottomOfChat();
				})
				.catch((err) =>
				{
					console.error('error', err);
				});
		};

		onMounted(() =>
		{
			// #region Detect channel changed
			window.addEventListener('chatChannelSelected', (e: Event) =>
			{
				const detail = (e as CustomEvent).detail;
				messages.value.length = 0;
				getMessages(detail.channelId);
			});
			const channelId = String(localStorage.getItem('chat::channel::id'));
			if (channelId)
				getMessages(channelId);
			// #endregion

			// #region New message
			socket.on('newMessage', (res) =>
			{
				const newMessages: messageInterface = {
					user: {
						id: res.data.creator.id,
						pseudo: res.data.creator.pseudo,
						avatar: res.data.creator.avatar,
						connected: res.data.creator.connected
					},
					messages: []
				};
				[...res.data.content.split(/<\/?div>/)].filter((el) => el.length > 0).map((el) => el.trim()).forEach((mes) =>
				{
					newMessages.messages.push({
						id: res.data.id,
						content: String(mes),
						timestamp: res.data.timestamp,
						modified: res.data.modified
					});
				});
				if (messages.value[messages.value.length - 1].user.id === res.data.creator.id)
				{
					messages.value[messages.value.length - 1].messages = [
						...messages.value[messages.value.length - 1].messages,
						...newMessages.messages
					];
				}
				else
					messages.value.push(JSON.parse(JSON.stringify(newMessages)));
				getBottomOfChat();
			});
			// #endregion
		});

		return {
			chat,
			loading,
			noError,
			editor,
			messages,
			userId,
			insertImage,
			sendMessage,
			generateTimestamp
		};
	}
});
</script>

<style>
	.channel {
		background-color: rgb(230, 230, 230);
		overflow-x: auto;
	}
	.chat {
		display: inline-flex;
		flex-direction: column-reverse;
		height: calc(100vh - 50px) !important;
	}
	.chat .message-list {
		padding: .5em;
		overflow-x: auto;
	}
	.chat form img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.user {
		background-color: rgb(230, 230, 230);
		overflow-x: auto;
	}
	.emoticon {
		vertical-align: middle;
		height: .75em;
		width: .75em;
	}
</style>
