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
						:class="(channel.id === selectedChannelId) ? 'selected-channel' : ''"
						@click="channelIsSelected(channel.id, channel.type)"
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
								v-if="contextMenuIsCreator"
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
	<dialog-alert
		:userId="userId"
		:channelName="selectedChannelName"
		:dialogShow="dialogAlertShow"
		:dialogUser="dialogAlertUser"
		:dialogType="dialogAlertType"
		:dialogToggle="dialogAlertToggle"
		@dialog-alert-accept="dialogAlertShow = false"
	/>
	<dialog-creation
		:userId="userId"
		:dialogCreationShow="dialogCreationShow"
		@dialog-creation-hide="dialogCreationShow = false"
	/>
	<dialog-password
		:dialogPasswordShow="dialogPasswordShow"
		:channelName="selectedChannelName"
		:channelPassword="selectedChannelPasswordValue"
		@dialog-password-hide="hideDialogPassword"
		@dialog-password-ok="openDialogPasswordOk"
	/>
	<dialog-edition
		:userId="userId"
		:dialogEditionShow="dialogEditionShow"
		:channelId="contextMenuSelectId"
		:channelName="contextMenuSelectName"
		:channelType="contextMenuSelectType"
		:channelPassword="contextMenuSelectPassword"
		:channelOwner="contextMenuSelectOwner"
		@dialog-edition-alert="openDialogAlert"
		@dialog-edition-update-user="updateUser"
		@dialog-edition-hide="dialogEditionShow = false"
	/>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QMenu } from 'quasar';
import { Socket } from 'socket.io-client';
import { defineComponent, onMounted, ref, inject, watch } from 'vue';

import dialogAlert from './chatComponents/DialogAlert.vue';
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
	creationDate: Date,
	admins: number[],
	muted: number[],
	banned: number[]
}

interface updateUserInterface {
	userId: number,
	admin: boolean,
	muted: boolean,
	banned: boolean,
	deleted: boolean
}

export default defineComponent({
	name: 'chat_channel',
	props: ['userId'],
	emits: [
		'channel-is-selected',
		'channel-user-update'
	],
	components: {
		dialogAlert,
		dialogCreation,
		dialogDeletion,
		dialogEdition,
		dialogPassword
	},
	setup (props, { emit })
	{
		const socket: Socket = inject('socketChat') as Socket;

		const loading = ref(true);
		const noError = ref(true);

		const channels = ref(new Array<channelInterface>()); // eslint-disable-line no-array-constructor

		const contextmenu = ref<QMenu | null>(null);
		const contextMenuSelectId = ref(0);
		const contextMenuSelectName = ref();
		const contextMenuSelectType = ref();
		const contextMenuSelectOwner = ref(0);
		const contextMenuSelectPassword = ref();
		const contextMenuIsCreator = ref(false);

		const selectedChannelError = ref<boolean>(false);
		const selectedChannelPassword = ref();
		const selectedChannelId = ref(0);
		const selectedChannelType = ref();
		const selectedChannelPasswordValue = ref();
		const selectedChannelName = ref();

		const sendEvent = (channelId: number, isDeleted = false) =>
		{
			selectedChannelId.value = channelId;
			emit('channel-is-selected', {
				id: channelId,
				socketId: socket.id,
				isDeleted
			});
		};

		let emitFromChannel = false;
		let saveEmitChannelId = -1;
		const channelIsSelected = (channelId: number, channelType: string) =>
		{
			if (!selectedChannelId.value ||
				(selectedChannelId.value && selectedChannelId.value !== channelId))
			{
				emitFromChannel = true;
				saveEmitChannelId = channelId;
				selectedChannelType.value = channelType;
				socket.emit('channel::get', channelId);
			}
		};
		socket.on('channel::receive::get', (ret) =>
		{
			if (!emitFromChannel || ret.socketId !== socket.id)
				return;

			selectedChannelName.value = ret.data.name;
			for (const banned of ret.data.bannedUsers)
			{
				if (banned.user.id === props.userId)
				{
					saveEmitChannelId = -1;
					openDialogAlert(ret.data.id, props.userId, 'banned', true, true);
					return;
				}
			}

			if (selectedChannelType.value !== 'protected')
				sendEvent(saveEmitChannelId);
			else
			{
				selectedChannelPasswordValue.value = ret.data.password;
				openDialogPassword();
			}
			emitFromChannel = false;
		});

		const openContextualMenu = (e: Event) =>
		{
			let target = e.target as HTMLElement;
			dialogEditionShow.value = false;
			contextMenuIsCreator.value = false;
			if (target)
			{
				while (!target.classList.contains('q-item'))
					target = target.parentNode as HTMLElement;
				if (target.hasAttribute('data-id'))
				{
					contextMenuSelectId.value = Number(target.getAttribute('data-id'));
					for (const channel of channels.value)
					{
						if (channel.id === contextMenuSelectId.value)
						{
							if (!channel.banned.includes(Number(props.userId)) &&
								(
									channel.owner === props.userId ||
									channel.admins.includes(Number(props.userId))
								)
							)
							{
								if (channel.owner === props.userId)
									contextMenuIsCreator.value = true;
								contextMenuSelectId.value = channel.id;
								contextMenuSelectName.value = channel.name;
								contextMenuSelectType.value = channel.type;
								contextMenuSelectPassword.value = channel.password;
								contextMenuSelectOwner.value = channel.owner;
								return;
							}
							contextmenu.value?.hide();
							return;
						}
					}
				}
			}
			contextmenu.value?.hide();
		};

		// #region Update user of channel
		const updateUser = (channelId: number, user: updateUserInterface) =>
		{
			const setVal = (type: string, compare: boolean, arr: number[], hideEdition = false, hideOnInsert = true) =>
			{
				const x = arr.indexOf(user.userId);
				if (x !== -1)
					arr.splice(x, 1);
				if (compare)
				{
					arr.push(user.userId);
					if (hideEdition && hideOnInsert && user.userId === props.userId)
						dialogEditionShow.value = false;
				}
				else
				{
					if (hideEdition && !hideOnInsert && user.userId === props.userId)
						dialogEditionShow.value = false;
				}
			};

			for (const _i in channels.value)
			{
				const i = Number(_i);
				if (channels.value[i].id !== channelId)
					continue;
				if (user.deleted)
				{
					channels.value.splice(i, 1);
					return;
				}
				setVal('admin', user.admin, channels.value[i].admins, true, false);
				setVal('banned', user.banned, channels.value[i].banned, true);
				setVal('muted', user.muted, channels.value[i].muted);
				emit('channel-user-update', {
					user: user.userId,
					admin: user.admin,
					banned: user.banned,
					muted: user.muted
				});
			}
		};
		// #endregion Update user of channel

		// #region Alert
		const dialogAlertShow = ref(false);
		const dialogAlertUser = ref<number>();
		const dialogAlertType = ref<string>();
		const dialogAlertToggle = ref<boolean>();
		const openDialogAlert = (channelId: number, user: number, type: string, toggle: boolean, bypass = false) =>
		{
			if (bypass === false && selectedChannelId.value !== channelId)
				return;
			console.log('print alert');
			dialogAlertUser.value = user;
			dialogAlertType.value = type;
			dialogAlertToggle.value = toggle;
			dialogAlertShow.value = true;
		};
		// #endregion Alert

		// #region Dialog
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
		const hideDialogPassword = (isSet: boolean) =>
		{
			dialogPasswordShow.value = false;
			if (isSet === false)
				saveEmitChannelId = -1;
		};
		const openDialogPasswordOk = (isSet: boolean) =>
		{
			sendEvent(saveEmitChannelId);
			if (isSet === false)
				saveEmitChannelId = -1;
		};

		const dialogEditionShow = ref(false);
		const openDialogEdition = () =>
		{
			dialogEditionShow.value = true;
		};
		// #endregion Dialog

		// #region Socket
		const generateData = (channel: any) =>
		{
			const randomColor = () =>
			{
				const __colors = ['#ffc93c', '#ff9a3c', '#ff6f3c', '#49beb7', '#35bcbf', '#c5d86d'];
				return __colors[Math.floor(Math.random() * __colors.length)];
			};
			const ret: channelInterface = {
				id: channel.id,
				owner: channel.owner.id,
				color: randomColor(),
				type: channel.type,
				name: channel.name,
				password: channel.password,
				creationDate: channel.creationDate,
				admins: channel.admins.map((el: any) => el.id),
				muted: channel.mutedUsers.map((el: any) => el.user.id),
				banned: channel.bannedUsers.map((el: any) => el.user.id)
			};
			return ret;
		};

		onMounted(() => socket.emit('channel::gets'));
		socket.on('channel::receive::gets', (ret) =>
		{
			if (ret.socketId !== socket.id)
				return;
			if (!ret.data)
			{
				loading.value = false;
				noError.value = false;
				return;
			}
			loading.value = false;
			noError.value = true;
			channels.value.length = 0;

			for (const el in ret.data)
			{
				if (ret.data[el].type === 'public' || ret.data[el].type === 'protected')
					channels.value.push(generateData(ret.data[el]));
				else
				{
					for (const user of ret.data[el].users)
					{
						if (user.id === props.userId)
						{
							channels.value.push(generateData(ret.data[el]));
							break;
						}
					}
				}
			}
		});

		socket.on('channel::receive::add', (ret) =>
		{
			if (ret.channel && ret.channel.created)
			{
				if (ret.channel.data.type === 'public' || ret.channel.data.type === 'protected')
					channels.value.push(generateData(ret.channel.data));
				else if (ret.channel.data.type === 'direct')
				{
					for (const user of ret.channel.data.users)
					{
						if (user.id === props.userId)
						{
							channels.value.push(generateData(ret.channel.data));
							return;
						}
					}
				}
			}
		});

		socket.on('channel::receive::update', (ret) =>
		{
			for (const i in channels.value)
			{
				if (channels.value[i].id === ret.data.data.id)
				{
					channels.value[i].name = ret.data.data.name;
					channels.value[i].type = ret.data.data.type;
					channels.value[i].owner = ret.data.data.owner.id;
					channels.value[i].password = ret.data.data.password;
					return;
				}
			}
		});

		socket.on('channel::receive::delete', (ret) =>
		{
			for (const i in channels.value)
			{
				if (channels.value[i].id === ret.data.id)
				{
					channels.value.splice(Number(i), 1);
					sendEvent(-1, true);
					return;
				}
			}
		});
		// #endregion Socket

		watch(() => props.userId, () =>
		{
			loading.value = true;
			noError.value = true;
			socket.emit('channel::gets');
		});

		return {
			loading,
			noError,

			channels,

			contextmenu,
			contextMenuSelectId,
			contextMenuSelectType,
			contextMenuSelectName,
			contextMenuSelectPassword,
			contextMenuSelectOwner,
			contextMenuIsCreator,

			selectedChannelId,
			selectedChannelError,
			selectedChannelPassword,
			selectedChannelPasswordValue,
			selectedChannelName,

			sendEvent,
			channelIsSelected,
			openContextualMenu,
			updateUser,

			// ====== Dialogs ====== //

			dialogAlertShow,
			dialogAlertUser,
			dialogAlertType,
			dialogAlertToggle,
			openDialogAlert,

			dialogCreationShow,
			openDialogCreation,

			dialogDeletionShow,
			openDialogDeletion,

			dialogPasswordShow,
			openDialogPassword,
			hideDialogPassword,
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
