<template>
	<div>
		<q-radio v-model="userId" :val="Number(1)">Clément user</q-radio>
		<q-radio v-model="userId" :val="Number(2)">John user</q-radio>
		<q-radio v-model="userId" :val="Number(3)">Titi user</q-radio>
	</div>
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
					:sent="userId === message.user.id"
					text-color="white"
					:bg-color="(userId === message.user.id) ? 'cyan-8' : 'blue-8'"
				>
					<template v-slot:name>{{ (userId !== message.user.id) ? message.user.pseudo: $t('chat.message.me') }}</template>
					<template v-slot:stamp>{{ generateTimestamp(message.messages[message.messages.length - 1].timestamp) }}</template>
					<template v-slot:avatar>
						<img
							:class="(userId === message.user.id) ? 'q-message-avatar q-message-avatar--sent' : 'q-message-avatar q-message-avatar--received'"
							:src="message.user.avatar"
							v-on:error="imageError"
						/>
					</template>
					<div
						v-for="el of message.messages"
						v-bind:key="el.id"
						:data-id="String(el.id)"
						v-html="el.content"
					></div>
				</q-chat-message>
			</template>
			<q-menu
				ref="contextmenu"
				touch-position
				context-menu
				@before-show="openContextualMenu"
			>
				<q-list bordered padding>
					<q-item
						clickable
						@click="editMessage"
					>
						<q-item-section avatar>
							<q-icon name="edit"></q-icon>
						</q-item-section>
						<q-item-section>{{ $t('chat.menu.edit') }}</q-item-section>
					</q-item>
					<q-item
						clickable
						@click="deleteMessage"
					>
						<q-item-section avatar>
							<q-icon name="delete"></q-icon>
						</q-item-section>
						<q-item-section>{{ $t('chat.menu.delete') }}</q-item-section>
					</q-item>
				</q-list>
			</q-menu>
		</div>
	</template>
</template>

<script lang="ts">
import { AxiosInstance } from 'axios';
import { TypeOfObject, Timestamp } from 'src/boot/libs';
import { Socket } from 'socket.io-client';
import { defineComponent, onMounted, ref, inject, nextTick } from 'vue';
import { QMenu } from 'quasar';

interface arrayInterface {
	id: number,
	content: string,
	timestamp: string,
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
		const socket: Socket = inject('socketChat') as Socket;
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const typeofObject: TypeOfObject = inject('typeofObject') as TypeOfObject;
		const timestamp: Timestamp = inject('timestamp') as Timestamp;

		const contextmenu = ref<QMenu | null>(null);
		const chat = ref<HTMLDivElement | null>(null);
		const loading = ref(true);
		const noError = ref(true);
		const editor = ref('');
		const messages = ref(new Array<messageInterface>()); // eslint-disable-line no-array-constructor
		const userId = ref(1); // A changer avec le vrai id de l'utilisateur

		// Clean var is reload
		localStorage.setItem('chat::user::id', String(userId.value)); // A revoir plus tard
		const messageEditId = ref(-1);

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

		const imageError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		const generateTimestamp = (time: string) =>
		{
			const messageDate = timestamp(time);
			if (!messageDate)
				return '';
			return `${messageDate.day}/${messageDate.month}/${messageDate.year} - ${messageDate.hour}h${messageDate.minute}`;
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
				.catch(() =>
				{
					loading.value = false;
					noError.value = false;
				});
		};

		const sendMessage = async () =>
		{
			if (editor.value.length <= 0)
				return;
			if (messageEditId.value === -1)
			{
				socket.emit('message::add',
					{
						id: userId.value,
						channel: localStorage.getItem('chat::channel::id'),
						message: editor.value,
						length: editor.value.length,
						timestamp: Date.now(),
						hash: await calcHash(editor.value)
					});
			}
			else
			{
				socket.emit('message::update',
					{
						id: userId.value,
						channel: localStorage.getItem('chat::channel::id'),
						messageId: messageEditId.value,
						message: editor.value,
						length: editor.value.length,
						timestamp: Date.now(),
						hash: await calcHash(editor.value)
					});
			}
			editor.value = '';
			messageEditId.value = -1;
		};

		const editMessage = () =>
		{
			const channelId = String(localStorage.getItem('chat::channel::id'));
			api.get(`/chat/message/get/${channelId}/${messageEditId.value}`)
				.then((res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					editor.value = res.data.messages.content;
					contextmenu.value?.hide();
				})
				.catch((err) =>
				{
					console.error('error', err);
				});
		};

		const deleteMessage = () =>
		{
			const channelId = String(localStorage.getItem('chat::channel::id'));
			api.get(`/chat/message/get/${channelId}/${messageEditId.value}`)
				.then(async (res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					contextmenu.value?.hide();
					socket.emit('message::delete',
						{
							id: userId.value,
							channel: localStorage.getItem('chat::channel::id'),
							messageId: messageEditId.value,
							message: editor.value,
							length: editor.value.length,
							timestamp: Date.now(),
							hash: await calcHash(editor.value)
						});
					messageEditId.value = -1;
				})
				.catch((err) =>
				{
					console.error('error', err);
				});
		};

		const openContextualMenu = (e: Event) =>
		{
			let target = e.target as HTMLElement;
			if (!target || (target && target.classList.contains('message-list')))
			{
				contextmenu.value?.hide();
				return;
			}
			while (!target.classList.contains('q-message-text'))
			{
				if (target.classList.contains('q-message-container'))
					break;
				target = target.parentNode as HTMLElement;
			}
			if (contextmenu.value)
			{
				contextmenu.value.updatePosition();
				if (!target.classList.contains('q-message-text--sent'))
					contextmenu.value.hide();
				else
				{
					contextmenu.value.show();
					let dataId: string;
					const getDataId = (list: HTMLCollection) =>
					{
						if (!list.length || dataId)
							return;
						for (let i = 0; i < list.length; i++)
						{
							if (list[i].hasAttribute('data-id') && !dataId)
							{
								const ret = list[i].getAttribute('data-id');
								if (ret)
								{
									dataId = ret;
									messageEditId.value = Number(ret);
								}
								return;
							}
							if (list[i].children)
								getDataId(list[i].children);
						}
					}; getDataId(target.children);
				}
			}
		};

		onMounted(() =>
		{
			// #region Detect channel changed
			window.addEventListener('chat::channel::selected', (e: Event) =>
			{
				const detail = (e as CustomEvent).detail;
				messages.value.length = 0;
				if (!detail.isDeleted)
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
				if (messages.value.length > 0 &&
					messages.value[messages.value.length - 1].user.id === res.data.creator.id)
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

			// #region Update message
			socket.on('updateMessage', (res) =>
			{
				if (!res.data.content.length)
				{
					deleteMessage(res);
					return;
				}
				for (const block of messages.value)
				{
					if (block.user.id === userId.value)
					{
						for (const i in block.messages)
						{
							if (block.messages[i].id === res.data.id)
							{
								block.messages[i].content = res.data.content;
								return;
							}
						}
					}
				}
			});
			// #endregion

			// #region Delete message
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const deleteMessage = (res: any) =>
			{
				for (const x in messages.value)
				{
					if (messages.value[x].user.id === userId.value)
					{
						for (const y in messages.value[x].messages)
						{
							if (messages.value[x].messages[y].id === Number(res.id))
							{
								if (messages.value[x].messages.length === 1)
									messages.value.splice(Number(x), 1);
								else
									messages.value[x].messages.splice(Number(y), 1);
								return;
							}
						}
					}
				}
			};

			socket.on('deleteMessage', (res) =>
			{
				deleteMessage(res);
			});
			// #endregion
		});

		return {
			contextmenu,
			chat,
			loading,
			noError,
			editor,
			messages,
			userId,
			openContextualMenu,
			imageError,
			insertImage,
			sendMessage,
			generateTimestamp,
			editMessage,
			deleteMessage
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
