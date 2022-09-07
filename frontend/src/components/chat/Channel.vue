<template>
	<div style="max-width: 100%;">
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
						@click="changeChannel(channel.id, channel.type)"
						:data-id="channel.id"
					>
						<q-item-section avatar>
							<div class="channel-avatar" :style="{ backgroundColor: `${channel.color}` }">
								<span>{{ channel.name.slice(0, 2).toUpperCase() }}</span>
							</div>
							<q-badge
								class="icon-private-message"
								color="green-7"
								v-if="channel.type === 'direct'"
							>
								<q-icon name="forum"></q-icon>
								<q-tooltip anchor="center right" self="center left">{{ $t('chat.mp') }}</q-tooltip>
							</q-badge>
						</q-item-section>
						<q-item-section class="channel-text-break">{{ channel.name }}</q-item-section>
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
								v-if="contextMenuSelectType !== 'direct' && (contextMenuIsCreator || contextMenuIsAdmin)"
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
								v-if="contextMenuUserIsIn"
								@click="openDialogQuit(); contextmenu?.hide()"
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
		:channelId="saveEmitChannelId"
		:channelName="selectedChannelName"
		:userId="userId"
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
	<dialog-quit
		:dialogQuitShow="dialogQuitShow"
		:channelCreator="contextMenuIsCreator"
		:channelName="contextMenuSelectName"
		:channelId="contextMenuSelectId"
		@dialog-quit-ok="validationQuitDialog"
		@dialog-quit-hide="dialogQuitShow = false"
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
import dialogQuit from './chatComponents/DialogQuit.vue';

interface channelInterface {
	id: number,
	owner: number,
	color: string,
	type: string,
	name: string,
	password: string,
	creationDate: Date,
	admins: number[],
	users: number[],
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
		'channel-user-update',
		'channel-ban-mute'
	],
	components: {
		dialogAlert,
		dialogCreation,
		dialogDeletion,
		dialogEdition,
		dialogPassword,
		dialogQuit
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
		const contextMenuIsAdmin = ref(false);
		const contextMenuUserIsIn = ref(false);

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

		const openContextualMenu = (e: Event) =>
		{
			let target = e.target as HTMLElement;
			dialogEditionShow.value = false;
			contextMenuIsCreator.value = false;
			contextMenuIsAdmin.value = false;
			contextMenuUserIsIn.value = false;

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
							if (!channel.banned.includes(Number(props.userId)))
							{
								if (channel.owner === props.userId)
									contextMenuIsCreator.value = true;
								if (channel.admins.includes(Number(props.userId)))
									contextMenuIsAdmin.value = true;
								contextMenuSelectId.value = channel.id;
								contextMenuSelectName.value = channel.name;
								contextMenuSelectType.value = channel.type;
								contextMenuSelectPassword.value = channel.password;
								contextMenuSelectOwner.value = channel.owner;
								for (const channel of channels.value)
								{
									if (channel.id === contextMenuSelectId.value &&
										channel.users.includes(props.userId))
									{
										contextMenuUserIsIn.value = true;
										break;
									}
								}
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

		// #region Channel selection
		let emitFromChannel = false;
		const saveEmitChannelId = ref(-1);
		let userIsExistChannel = false;

		const getLinkColor = (channelId: number) =>
		{
			const __colors = ['#ffc93c', '#ff9a3c', '#ff6f3c', '#49beb7', '#35bcbf', '#c5d86d'];
			const n = (channelId / (__colors.length - 1));
			const m = n % 1;

			const extract = () =>
			{
				if (n <= 1)
					return channelId;
				if (m === 0 && n <= (__colors.length - 1))
					return n;
				let i = Number(m.toFixed(1)[2]);
				if (i > (__colors.length - 1))
					i -= (__colors.length - 1);
				return i;
			};
			return __colors[extract()];
		};

		const getChannel = (channelId: number) =>
		{
			for (const i in channels.value)
			{
				if (channels.value[i].id === channelId)
					return Number(i);
			}
			return -1;
		};

		const changeChannel = (channelId: number, channelType: string) =>
		{
			if (!selectedChannelId.value ||
				(selectedChannelId.value && selectedChannelId.value !== channelId))
			{
				emitFromChannel = true;
				saveEmitChannelId.value = channelId;
				selectedChannelType.value = channelType;
				socket.emit('channel::get', channelId);
			}
		};
		const sendEventChangeChannel = () =>
		{
			if (!userIsExistChannel)
			{
				socket.emit('channel::user::add', {
					channelId: saveEmitChannelId.value,
					userId: props.userId
				});
			}
			userIsExistChannel = false;
			sendEvent(saveEmitChannelId.value);
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
					saveEmitChannelId.value = -1;
					openDialogAlert(ret.data.id, props.userId, 'banned', true, true);
					return;
				}
			}

			for (const user of ret.data.users)
			{
				if (user.id === props.userId)
				{
					userIsExistChannel = true;
					break;
				}
			}

			if (selectedChannelType.value !== 'protected')
				sendEventChangeChannel();
			else
			{
				selectedChannelPasswordValue.value = ret.data.password;
				openDialogPassword();
			}
			emitFromChannel = false;
		});
		// #endregion Channel selection

		// #region Cron task for remove ban/mute user
		socket.on('banned::cron::delete', (ret) =>
		{
			if (!ret)
				return;
			const i = getChannel(ret.channel);
			if (i === -1)
				return;
			const x = channels.value[i].banned.indexOf(ret.user);
			if (x !== -1)
			{
				channels.value[i].banned.splice(x, 1);
				banMutChange(ret.user, ret.channel, false, null);
				if (selectedChannelId.value === ret.channel)
					openDialogAlert(ret.id, props.userId, 'banned', false, true);
			}
		});

		socket.on('muted::cron::delete', (ret) =>
		{
			if (!ret || (ret && ret.deleted === false))
				return;
			const i = getChannel(ret.channel);
			if (i === -1)
				return;
			const x = channels.value[i].muted.indexOf(ret.user);
			if (x !== -1)
			{
				channels.value[i].muted.splice(x, 1);
				banMutChange(ret.user, ret.channel, null, false);
				if (selectedChannelId.value === ret.channel)
					openDialogAlert(ret.id, props.userId, 'muted', false, true);
			}
		});
		// #endregion Cron task for remove ban or mute user

		// #region Update channel
		const banMutChange = (user: number, channel: number, ban: boolean|null, mute: boolean|null) =>
		{
			emit('channel-ban-mute', {
				user,
				channel,
				ban,
				mute
			});
		};

		socket.on('channel::user::receive::remove', (ret) =>
		{
			if (!ret.data.deleted || ret.data.data.id !== props.userId)
				return;

			if (ret.data.channel !== selectedChannelId.value)
				selectedChannelId.value = 0;

			const i = getChannel(ret.data.channel);

			let x = channels.value[i].admins.indexOf(ret.data.data.id);
			if (x !== -1)
				channels.value[i].admins.splice(x, 1);

			x = channels.value[i].banned.indexOf(ret.data.data.id);
			if (x !== -1)
				channels.value[i].banned.splice(x, 1);

			x = channels.value[i].muted.indexOf(ret.data.data.id);
			if (x !== -1)
				channels.value[i].muted.splice(x, 1);

			x = channels.value[i].muted.indexOf(ret.data.data.id);
			if (x !== -1)
				channels.value[i].muted.splice(x, 1);

			x = channels.value[i].users.indexOf(ret.data.data.id);
			if (x !== -1)
				channels.value[i].users.splice(x, 1);

			if (dialogEditionShow.value === true)
				dialogEditionShow.value = false;

			sendEvent(-1, true);
		});

		socket.on('admin::receive::set', (ret) =>
		{
			const i = getChannel(ret.data.channel);
			if (i !== -1)
				channels.value[i].admins.push(ret.data.user);
		});
		socket.on('admin::receive::delete', (ret) =>
		{
			const i = getChannel(ret.data.channel);
			const x = channels.value[i].admins.indexOf(ret.data.user);
			if (i !== -1 && x !== -1)
			{
				if (props.userId === ret.data.user && dialogEditionShow.value === true)
					dialogEditionShow.value = false;
				channels.value[i].admins.splice(x, 1);
			}
		});

		socket.on('banned::receive::set', (ret) =>
		{
			const i = getChannel(ret.data.channel);
			if (i !== -1)
			{
				channels.value[i].banned.push(ret.data.user);
				banMutChange(ret.data.user, ret.data.channel, true, null);
				if (selectedChannelId.value === ret.data.channel)
					openDialogAlert(ret.data.id, props.userId, 'banned', true, true);
			}
		});
		socket.on('banned::receive::delete', (ret) =>
		{
			const i = getChannel(ret.data.channel);
			const x = channels.value[i].banned.indexOf(ret.data.user);
			if (i !== -1 && x !== -1)
			{
				channels.value[i].banned.splice(x, 1);
				banMutChange(ret.data.user, ret.data.channel, false, null);
				if (selectedChannelId.value === ret.data.channel)
					openDialogAlert(ret.data.id, props.userId, 'banned', false, true);
			}
		});

		socket.on('muted::receive::set', (ret) =>
		{
			const i = getChannel(ret.data.channel);
			if (i !== -1)
			{
				channels.value[i].muted.push(ret.data.user);
				banMutChange(ret.data.user, ret.data.channel, null, true);
				if (selectedChannelId.value === ret.data.channel)
					openDialogAlert(ret.data.id, props.userId, 'muted', true, true);
			}
		});
		socket.on('muted::receive::delete', (ret) =>
		{
			const i = getChannel(ret.data.channel);
			const x = channels.value[i].muted.indexOf(ret.data.user);
			if (i !== -1 && x !== -1)
			{
				channels.value[i].muted.splice(x, 1);
				banMutChange(ret.data.user, ret.data.channel, null, false);
				if (selectedChannelId.value === ret.data.channel)
					openDialogAlert(ret.data.id, props.userId, 'muted', false, true);
			}
		});

		const updateUser = (channelId: number, user: updateUserInterface) =>
		{
			const setVal = (compare: boolean, arr: number[], hideEdition = false, hideOnInsert = true) =>
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
				if (user.admin)
					setVal(user.admin, channels.value[i].admins, true, false);
				if (user.banned)
					setVal(user.banned, channels.value[i].banned, true);
				if (user.muted)
					setVal(user.muted, channels.value[i].muted);
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
				saveEmitChannelId.value = -1;
		};
		const openDialogPasswordOk = (isSet: boolean) =>
		{
			sendEventChangeChannel();
			if (isSet === false)
				saveEmitChannelId.value = -1;
		};

		const dialogEditionShow = ref(false);
		const openDialogEdition = () =>
		{
			dialogEditionShow.value = true;
		};

		const dialogQuitShow = ref(false);
		const openDialogQuit = () =>
		{
			for (const channel of channels.value)
			{
				if (channel.id === contextMenuSelectId.value && channel.users.includes(props.userId))
				{
					dialogQuitShow.value = true;
					return;
				}
			}
		};
		const validationQuitDialog = (val: boolean) =>
		{
			dialogQuitShow.value = false;
			if (val === false)
				return;
			if (contextMenuIsCreator.value)
			{
				socket.emit('channel::delete', {
					id: contextMenuSelectId.value,
					creator: props.userId,
					name: null,
					type: null,
					password: null
				});
			}
			else
			{
				socket.emit('channel::user::remove', {
					channelId: contextMenuSelectId.value,
					userId: props.userId
				});
			}
			selectedChannelId.value = 0;
			sendEvent(-1, true);
		};
		// #endregion Dialog

		// #region Socket
		const generateData = (channel: any) =>
		{
			const ret: channelInterface = {
				id: channel.id,
				owner: channel.owner.id,
				color: getLinkColor(channel.id),
				type: channel.type,
				name: channel.name,
				password: channel.password,
				creationDate: channel.creationDate,
				admins: channel.admins.map((el: any) => el.id),
				users: channel.users.map((el: any) => el.id),
				muted: channel.mutedUsers.map((el: any) => el.user.id),
				banned: channel.bannedUsers.map((el: any) => el.user.id)
			};
			return ret;
		};

		let getPrivateChannel = false;
		const index = (id: number) =>
		{
			for (const i in channels.value)
			{
				if (channels.value[i].id === id)
					return Number(i);
			}
			return -1;
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

		socket.on('channel::receive::change', (ret) =>
		{
			if (ret.socketId !== socket.id)
				return;
			selectedChannelId.value = 0;
			changeChannel(ret.data.id, ret.data.type);
		});

		socket.on('channel::receive::add', (ret) =>
		{
			if (ret.channel && ret.channel.created === true)
			{
				if (ret.channel.data.type === 'public' || ret.channel.data.type === 'protected')
					channels.value.push(generateData(ret.channel.data));
				else if (ret.channel.data.type === 'private' || ret.channel.data.type === 'direct')
				{
					for (const user of ret.users)
					{
						if (user.data.id === props.userId)
						{
							channels.value.push(generateData(ret.channel.data));
							if (user.data.id === ret.channel.data.owner.id)
							{
								// Force creator of private message to switch automatically to new channel
								selectedChannelId.value = 0;
								changeChannel(ret.channel.data.id, ret.channel.data.type);
							}
							return;
						}
					}
				}
			}
		});

		socket.on('channel::receive::update', (ret) =>
		{
			if (!ret.data.updated)
				return;
			for (const i in channels.value)
			{
				if (channels.value[i].id === ret.data.data.id)
				{
					if (ret.data.data.type === 'private' &&
						!channels.value[i].users.includes(props.userId))
					{
						channels.value.splice(Number(i), 1);
						if (selectedChannelId.value === ret.data.data.id)
							sendEvent(-1, false);
					}
					else
					{
						channels.value[i].name = ret.data.data.name;
						channels.value[i].type = ret.data.data.type;
						channels.value[i].owner = ret.data.data.owner.id;
						channels.value[i].password = ret.data.data.password;
					}
					return;
				}
			}
			if (ret.data.data.type !== 'private')
				channels.value.push(generateData(ret.data.data));
		});

		socket.on('channel::user::receive::add', (ret) =>
		{
			const i = index(ret.data.channel);

			getPrivateChannel = false;
			if (i !== -1)
				channels.value[i].users.push(ret.data.data.id);
			else if (ret.data.data.id === props.userId)
			{
				// Is private channel
				getPrivateChannel = true;
				socket.emit('channel::get', ret.data.channel);
			}
		});

		socket.on('channel::receive::get', (ret) =>
		{
			if (!getPrivateChannel || ret.socketId !== socket.id)
				return;
			channels.value.push(generateData(ret.data));
			getPrivateChannel = false;
		});

		socket.on('channel::user::receive::remove', (ret) =>
		{
			const i = index(ret.data.channel);
			if (i === -1)
				return;
			const x = channels.value[i].users.indexOf(ret.data.data.id);
			if (x !== -1)
				channels.value[i].users.splice(x, 1);
			if (channels.value[i].type === 'private' && ret.data.data.id === props.userId)
			{
				if (selectedChannelId.value === channels.value[i].id)
					sendEvent(-1, false);
				channels.value.splice(i, 1);
			}
		});

		socket.on('channel::receive::delete', (ret) =>
		{
			for (const i in channels.value)
			{
				if (channels.value[i].id === ret.data.id)
				{
					channels.value.splice(Number(i), 1);
					if (selectedChannelId.value === ret.data.id)
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
			contextMenuIsAdmin,
			contextMenuUserIsIn,

			selectedChannelId,
			selectedChannelError,
			selectedChannelPassword,
			selectedChannelPasswordValue,
			selectedChannelName,

			saveEmitChannelId,

			sendEvent,
			changeChannel,
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
			openDialogEdition,

			dialogQuitShow,
			openDialogQuit,
			validationQuitDialog
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
	.channel-text-break {
		word-break: break-all;
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
	.icon-private-message {
		position: absolute;
		bottom: .3em;
		left: 3.7em;
	}
</style>
