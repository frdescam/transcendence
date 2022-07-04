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
					<q-item>
						<q-item-section class="create-channel">
							<q-btn
								round
								flat
								icon="add_circle_outline"
								size="1.3em"
								@click="openDialogCreation"
							>
								<q-tooltip>{{ $t('chat.channel.createTooltip') }}</q-tooltip>
							</q-btn>
						</q-item-section>
					</q-item>
					<q-item clickable v-ripple
						v-for="channel in channels"
						v-bind:key="channel.id"
						:class="(channel.id === selectedChannel) ? 'selected-channel' : ''"
						@click="$emit('channelIsSelected', channelIsSelected(channel.id, channel.type))"
						:data-id="channel.id"
					>
						<q-item-section avatar>
							<div class="channel-avatar" :style="{ backgroundColor: `${channel.color}` }">
								<span>{{ channel.name.slice(0, 2).toUpperCase() }}</span>
							</div>
						</q-item-section>
						<q-item-section>{{ channel.name }}</q-item-section>
					</q-item>
					<q-menu
						ref="contextmenu"
						touch-position
						context-menu
						@before-show="openContextualMenu"
					>
						<q-list bordered padding>
							<q-item
								clickable
								@click="openDialogEdition(); contextmenu?.hide()"
							>
								<q-item-section avatar>
									<q-icon name="edit"></q-icon>
								</q-item-section>
								<q-item-section>{{ $t('chat.channel.menu.edit.title') }}</q-item-section>
							</q-item>
							<q-item
								clickable
								@click="openDialogDeletion(); contextmenu?.hide()"
							>
								<q-item-section avatar>
									<q-icon name="delete"></q-icon>
								</q-item-section>
								<q-item-section>{{ $t('chat.channel.menu.delete.title') }}</q-item-section>
							</q-item>
							<q-item
								clickable
							>
								<q-item-section avatar>
									<q-icon name="logout"></q-icon>
								</q-item-section>
								<q-item-section>{{ $t('chat.channel.menu.quit') }}</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
					<dialog-deletion
						:dialogDeletionShow="dialogDeletionShow"
						:contextMenuSelectId="contextMenuSelectId"
						:contextMenuSelectName="contextMenuSelectName"
						:userId="userId"
						@dialog-deletion-hide="dialogDeletionShow = false"
					/>
				</template>
				<template v-else>
					<q-item v-ripple class="full-width row no-wrap justify-center">
						<q-icon size="xl" name="cloud_off"></q-icon>
					</q-item>
				</template>
			</template>
		</q-list>
	</div>
	<dialog-creation
		:dialogCreationShow="dialogCreationShow"
		@dialog-creation-hide="dialogCreationShow = false"
	/>
	<dialog-password
		:dialogPasswordShow="dialogPasswordShow"
		:channelName="selectedChannelName"
		:channelPassword="selectedChannelPasswordValue"
		@dialog-password-hide="dialogPasswordShow = false"
		@dialog-password-ok="openDialogPasswordOk"
	/>
	<dialog-edition
		:dialogEditionShow="dialogEditionShow"
		:channelId="contextMenuSelectId"
		:channelName="contextMenuSelectName"
		:channelType="contextMenuSelectType"
		:channelPassword="contextMenuSelectPassword"
		:channelOwner="contextMenuSelectOwner"
		:userId="userId"
		@dialog-edition-hide="dialogEditionShow = false"
	/>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance } from 'axios';
import { QMenu } from 'quasar';
import { Socket } from 'socket.io-client';
import { TypeOfObject } from 'src/boot/libs';
import { defineComponent, onMounted, ref, inject } from 'vue';

import dialogCreation from './chatComponents/DialogCreation.vue';
import dialogDeletion from './chatComponents/DialogDeletion.vue';
import dialogEdition from './chatComponents/DialogEdition.vue';
import dialogPassword from './chatComponents/DialogPassword.vue';

interface channelInterface {
	id: number,
	owner: number,
	color: string,
	type: string,
	name: string,
	password: string,
	creationDate: Date
}

export default defineComponent({
	name: 'chat_channel',
	components: {
		dialogCreation,
		dialogDeletion,
		dialogEdition,
		dialogPassword
	},
	setup ()
	{
		const socket: Socket = inject('socketChat') as Socket;
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const typeofObject: TypeOfObject = inject('typeofObject') as TypeOfObject;

		const loading = ref(true);
		const noError = ref(true);

		const channels = ref(new Array<channelInterface>()); // eslint-disable-line no-array-constructor

		// A modifier plus tard
		const userId = ref(Number(localStorage.getItem('chat::user::id')));

		const contextmenu = ref<QMenu | null>(null);
		const contextMenuSelectId = ref(0);
		const contextMenuSelectName = ref();
		const contextMenuSelectType = ref();
		const contextMenuSelectOwner = ref(0);
		const contextMenuSelectPassword = ref();

		const selectedChannel = ref(0);
		if (localStorage.getItem('chat::channel::id'))
			selectedChannel.value = Number(localStorage.getItem('chat::channel::id'));
		const selectedChannelError = ref<boolean>(false);
		const selectedChannelPassword = ref();
		const selectedChannelId = ref(0);
		const selectedChannelPasswordValue = ref();
		const selectedChannelName = ref();

		const sendEvent = (channelId: number, isDeleted = false) =>
		{
			selectedChannel.value = channelId;
			localStorage.setItem('chat::channel::id', channelId.toString(10));
			window.dispatchEvent(
				new CustomEvent('chat::channel::selected',
					{
						bubbles: true,
						cancelable: true,
						composed: true,
						detail: {
							channelId,
							isDeleted
						}
					}
				)
			);
		};

		const channelIsSelected = (channelId: number, channelType: string) =>
		{
			const __saveId = Number(localStorage.getItem('chat::channel::id'));
			if (!__saveId || (__saveId && __saveId !== channelId))
			{
				if (channelType !== 'protected')
					sendEvent(channelId);
				else
				{
					api.get<any>(`/chat/channel/get/no-messages/${channelId}`)
						.then((res) =>
						{
							selectedChannelPasswordValue.value = res.data.channel.password;
							selectedChannelName.value = res.data.channel.name;
							selectedChannelId.value = res.data.channel.id;
							openDialogPassword();
						})
						.catch((err) => console.log(err));
				}
			}
			return channelId;
		};

		const openContextualMenu = (e: Event) =>
		{
			let target = e.target as HTMLElement;
			if (target)
			{
				while (!target.classList.contains('q-item'))
					target = target.parentNode as HTMLElement;
				if (target.hasAttribute('data-id'))
				{
					contextMenuSelectId.value = Number(target.getAttribute('data-id'));
					for (const channel of channels.value)
					{
						if (channel.id === contextMenuSelectId.value &&
							channel.owner === userId.value)
						{
							contextMenuSelectId.value = channel.id;
							contextMenuSelectName.value = channel.name;
							contextMenuSelectType.value = channel.type;
							contextMenuSelectPassword.value = channel.password;
							contextMenuSelectOwner.value = channel.owner;
							return;
						}
					}
				}
			}
			contextmenu.value?.hide();
		};

		const dialogCreationShow = ref(false);
		const openDialogCreation = () =>
		{
			dialogCreationShow.value = true;
		};

		const dialogDeletionShow = ref(false);
		const openDialogDeletion = () =>
		{
			dialogDeletionShow.value = true;
		};

		const dialogPasswordShow = ref(false);
		const openDialogPassword = () =>
		{
			dialogPasswordShow.value = true;
		};
		const openDialogPasswordOk = () => sendEvent(selectedChannelId.value);

		const dialogEditionShow = ref(false);
		const openDialogEdition = () =>
		{
			dialogEditionShow.value = true;
		};

		onMounted(() =>
		{
			const randomColor = () =>
			{
				const __colors = ['#ffc93c', '#ff9a3c', '#ff6f3c', '#49beb7', '#35bcbf', '#c5d86d'];
				return __colors[Math.floor(Math.random() * __colors.length)];
			};

			api.get<any>('/chat/channel/get/no-messages')
				.then((res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					loading.value = false;
					for (const el in res.data.channels)
					{
						if (res.data.channels[el].type === 'public' || res.data.channels[el].type === 'protected')
						{
							channels.value.push({
								id: res.data.channels[el].id,
								owner: res.data.channels[el].owner.id,
								color: randomColor(),
								type: res.data.channels[el].type,
								name: res.data.channels[el].name,
								password: res.data.channels[el].password,
								creationDate: res.data.channels[el].creationDate
							});
						}
						else
						{
							for (const user of res.data.channels[el].users)
							{
								if (user.id === userId.value)
								{
									channels.value.push({
										id: res.data.channels[el].id,
										owner: res.data.channels[el].owner.id,
										color: randomColor(),
										type: res.data.channels[el].type,
										name: res.data.channels[el].name,
										password: res.data.channels[el].password,
										creationDate: res.data.channels[el].creationDate
									});
									break;
								}
							}
						}
					}
				})
				.catch(() =>
				{
					loading.value = false;
					noError.value = false;
				});

			socket.on('newChannel', (ret) =>
			{
				if (ret.created && ret.data.owner.id === userId.value)
				{
					channels.value.push({
						id: ret.data.id,
						owner: ret.data.owner.id,
						color: randomColor(),
						type: ret.data.type,
						name: ret.data.name,
						password: ret.data.password,
						creationDate: ret.data.creationDate
					});
				}
			});

			socket.on('updateChannel', (ret) =>
			{
				for (const i in channels.value)
				{
					if (channels.value[i].id === ret.data.id)
					{
						channels.value[i].name = ret.data.name;
						channels.value[i].type = ret.data.type;
						channels.value[i].owner = ret.data.owner.id;
						channels.value[i].password = ret.data.password;
						return;
					}
				}
			});

			socket.on('deleteChannel', (ret) =>
			{
				for (const i in channels.value)
				{
					if (channels.value[i].id === ret.id)
					{
						channels.value.splice(Number(i), 1);
						sendEvent(-1, true);
						return;
					}
				}
			});
		});

		return {
			loading,
			noError,

			channels,

			userId,

			contextmenu,
			contextMenuSelectId,
			contextMenuSelectType,
			contextMenuSelectName,
			contextMenuSelectPassword,
			contextMenuSelectOwner,

			selectedChannel,
			selectedChannelId,
			selectedChannelError,
			selectedChannelPassword,
			selectedChannelPasswordValue,
			selectedChannelName,

			// ====== Dialogs ====== //
			sendEvent,
			channelIsSelected,
			openContextualMenu,

			dialogCreationShow,
			openDialogCreation,

			dialogDeletionShow,
			openDialogDeletion,

			dialogPasswordShow,
			openDialogPassword,
			openDialogPasswordOk,

			dialogEditionShow,
			openDialogEdition
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
	.create-channel {
		display: flex !important;
		flex-direction: row !important;
		justify-content: center !important;
	}
	.dialog {
		overflow-y: auto;
		max-height: 45vh;
	}
	.selected-channel {
		background-color: #c8c8c8 !important;
	}
	.tab-row {
		min-height: 6em;
		width: 100%;
	}
	.tab-row .fill-input {
		width: 100%;
	}
	.tab-row > div {
		min-width: 30%;
	}
	.is-general {
		margin-right: 2em;
	}
	.is-input {
		margin-right: 2em;
		position: relative;
	}
	.tab-row > div span {
		margin-left: .4em
	}
</style>
