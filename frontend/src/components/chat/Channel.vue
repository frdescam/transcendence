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
					<q-item>
						<q-item-section class="create-channel">
							<q-btn
								round
								flat
								icon="add_circle_outline"
								size="1.3em"
								@click="openModal"
							>
								<q-tooltip>{{ $t('chat.channel.createTooltip') }}</q-tooltip>
							</q-btn>
						</q-item-section>
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
								@click="dialogEdit?.show(); contextmenu?.hide()"
							>
								<q-item-section avatar>
									<q-icon name="edit"></q-icon>
								</q-item-section>
								<q-item-section>{{ $t('chat.channel.menu.edit.title') }}</q-item-section>
							</q-item>
							<q-item
								clickable
								@click="deleteDialog?.show(); contextmenu?.hide()"
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

					<q-dialog
						ref="deleteDialog"
						persistent
						@before-hide="deleteDialogHide"
					>
					<q-card>
						<q-form
							@submit="deleteChannel"
						>
							<q-card-section class="row items-center">
								<q-avatar icon="delete_forever" />
								<span class="q-ml-sm">{{ $t('chat.channel.menu.delete.info') }}</span>
							</q-card-section>
							<q-card-section class="row items-center">
								<div class="text-h6">
									{{ $t('chat.channel.menu.delete.explanation') }} (<span style="text-decoration: underline">{{ contextMenuSelectName }}</span>)
								</div>
								<q-input
									style="width: 100%;"
									v-model="deleteDialogName"
									filled
									type="text"
									:label="$t('chat.channel.modal.name')"
									:rules="[
										(val: string) => val && val.length > 0 && val === contextMenuSelectName || $t('chat.channel.menu.delete.error')
									]"
								></q-input>
							</q-card-section>
							<q-card-actions align="right">
								<q-btn
									flat
									icon="close"
									color="red"
									:label="$t('chat.channel.menu.delete.cancel')"
									v-close-popup
									@click="deleteDialogConfirm = false"
								/>
								<q-btn
									flat
									icon="done"
									color="secondary"
									type="submit"
									:label="$t('chat.channel.menu.delete.delete')"
									@click="deleteDialogConfirm = true"
								/>
							</q-card-actions>
						</q-form>
					</q-card>
					</q-dialog>

				</template>
				<template v-else>
					<q-item v-ripple class="full-width row no-wrap justify-center">
						<q-icon size="xl" name="cloud_off"></q-icon>
					</q-item>
				</template>
			</template>
		</q-list>
	</div>
	<q-dialog
		ref="dialogchannel"
		model="fixed"
		square
		@hide="resetDialog"
	>
		<q-card>
			<q-card-section class="row items-center bg-primary text-white">
				<div class="text-h6">{{ $t('chat.channel.createTooltip') }}</div>
				<q-space />
				<q-btn icon="close" flat round dense v-close-popup />
			</q-card-section>
			<q-separator />
			<q-card-section class="dialog">
				<template v-if="newChannelError > 0">
					<q-banner
						inline-actions
						class="text-white bg-red"
					>
						<div v-if="newChannelError === 1">{{ $t('chat.channel.modal.listErrors.name') }}</div>
						<div v-if="newChannelError === 2">{{ $t('chat.channel.modal.listErrors.type') }}</div>
						<div v-if="newChannelError === 3">{{ $t('chat.channel.modal.listErrors.password') }}</div>
					</q-banner>
					<span style="display: block; height:1em"></span>
				</template>
				<q-form
					class="column justify-around"
					@submit="createChannel"
				>
					<q-input
						type="text"
						filled
						v-model="newChannelName"
						:label="$t('chat.channel.modal.name')"
						:rules="[(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')]"
					/>
					<q-space />
					<q-option-group
						v-model="newChannelType"
						:options="[
							{
								label: $t('chat.channel.modal.public'),
								value: 'public'
							},
							{
								label: $t('chat.channel.modal.protected'),
								value: 'protected'
							},
							{
								label: $t('chat.channel.modal.private'),
								value: 'private'
							}
						]"
						:label="$t('chat.channel.modal.type')"
						:rules="[
							(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')
						]"
					/>
					<div v-if="newChannelType === 'protected'">
						<q-separator inset style="margin-bottom: 1em;"/>
						<q-input
							v-model="newChannelPasswordOne"
							filled
							:type="isPwdOne ? 'password' : 'text'"
							:label="$t('chat.channel.modal.password')"
							:rules="[
								(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')
							]"
						>
							<template v-slot:append>
								<q-icon
									:name="isPwdOne ? 'visibility_off' : 'visibility'"
									class="cursor-pointer"
									@click="isPwdOne = !isPwdOne"
								/>
							</template>
						</q-input>
						<span style="display: block; height:1em"></span>
						<q-input
							v-model="newChannelPasswordTwo"
							filled
							:type="isPwdTwo ? 'password' : 'text'"
							:label="$t('chat.channel.modal.repeat')"
							:rules="[
								(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')
							]"
						>
							<template v-slot:append>
								<q-icon
									:name="isPwdTwo ? 'visibility_off' : 'visibility'"
									class="cursor-pointer"
									@click="isPwdTwo = !isPwdTwo"
								/>
							</template>
						</q-input>
						<q-separator inset style="margin-top: 1em;"/>
					</div>
					<q-btn :label="$t('chat.channel.modal.submit')" type="submit" color="primary"/>
				</q-form>
			</q-card-section>
		</q-card>
	</q-dialog>

	<q-dialog
		ref="dialogpassword"
		model="fixed"
		square
		@hide="resetDialogPassword"
	>
		<q-card>
			<q-card-section class="row items-center bg-primary text-white">
				<div class="text-h6" >{{ selectedChannelName }}</div>
				<q-space />
				<q-btn icon="close" flat round dense v-close-popup />
			</q-card-section>
			<q-separator />
			<q-card-section class="dialog">
				<template v-if="selectedChannelError">
					<q-banner
						inline-actions
						class="text-white bg-red"
					>
						{{ $t('chat.channel.password.incorrect') }}
					</q-banner>
					<span style="display: block; height:1em"></span>
				</template>
				<q-form
					class="column justify-around"
					@submit="verifyPassword"
				>
					<q-input
						type="text"
						filled
						v-model="selectedChannelPassword"
						:label="$t('chat.channel.password.password')"
						:rules="[(val: string) => val && val.length > 0 || $t('chat.channel.password.error')]"
					/>
					<q-space />
					<q-btn :label="$t('chat.channel.password.valid')" type="submit" color="primary"/>
				</q-form>
			</q-card-section>
		</q-card>
	</q-dialog>

	<q-dialog
		ref="dialogEdit"
		model="medium"
		@before-hide="editChannelReset"
		square
	>
		<q-card style="width: 700px; max-width: 80vw">
			<q-tabs
				dense
				align="justify"
				class="bg-primary text-white shadow-2"
				:breakpoint="0"
				v-model="dialogEditTab"
			>
				<q-tab name="general" icon="settings" :label="$t('chat.channel.menu.edit.tabs.general.title')" />
				<q-tab name="users" icon="groups" :label="$t('chat.channel.menu.edit.tabs.user.title')" />
				<q-tab name="mutedUsers" icon="voice_over_off" :label="$t('chat.channel.menu.edit.tabs.muted.title')" />
				<q-tab name="bannedUsers" icon="person_off" :label="$t('chat.channel.menu.edit.tabs.banned.title')" />
			</q-tabs>
			<q-card-section>
				<q-tab-panels
					v-model="dialogEditTab"
					animated
					swipeable
					transition-prev="jump-left"
					transition-next="jump-right"
				>
					<q-tab-panel name="general">
						<q-banner v-if="dialogEditGeneralNameError" class="bg-red text-white">
							{{ $t(`chat.channel.menu.edit.tabs.general.error.${dialogEditGeneralNameError}`) }}
						</q-banner>
						<q-banner v-if="dialogEditGeneralSuccess" class="bg-green text-white">
							{{ $t('chat.channel.menu.edit.tabs.general.success') }}
						</q-banner>
						<q-form
							@submit="editChannelGeneral"
						>
							<div class="row no-wrap items-center tab-row">
								<div class="row no-wrap items-center is-general">
									<q-icon name="info" size="2em"></q-icon>
									<span class="text-h6">{{ $t('chat.channel.menu.edit.tabs.general.type') }}</span>
								</div>
								<q-option-group
									v-model="dialogEditGeneralType"
									inline
									:options="[
										{
											label: $t('chat.channel.modal.public'),
											value: 'public'
										},
										{
											label: $t('chat.channel.modal.protected'),
											value: 'protected'
										},
										{
											label: $t('chat.channel.modal.private'),
											value: 'private'
										}
									]"
									:rules="[
										(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')
									]"
								/>
							</div>
							<div class="row no-wrap items-center tab-row">
								<div class="row no-wrap items-center is-input">
									<q-icon name="drive_file_rename_outline" size="2em"></q-icon>
									<span class="text-h6">{{ $t('chat.channel.menu.edit.tabs.general.name') }}</span>
								</div>
								<q-input
									filled
									class="fill-input"
									type="text"
									v-model="dialogEditGeneralName"
									:label="$t('chat.channel.menu.edit.tabs.general.name')"
									:rules="[(val: string) => val && val.length > 0 || `${$t('chat.channel.menu.edit.tabs.general.name')} ${$t('chat.channel.menu.edit.tabs.need')}`]"
								></q-input>
							</div>
							<div
								v-if="dialogEditGeneralType === 'protected'"
								class="row no-wrap items-center tab-row"
							>
								<div class="row no-wrap items-center is-input">
									<q-icon name="key" size="2em"></q-icon>
									<span class="text-h6">{{ $t('chat.channel.menu.edit.tabs.general.password') }}</span>
								</div>
								<div class="fill-input">
									<q-input
										v-if="contextMenuSelectType === 'protected'"
										filled
										style="margin-bottom: 2em"
										class="fill-input"
										:type="dialogEditGeneralOldPasswordVisible ? 'password' : 'text'"
										v-model="dialogEditGeneralOldPassword"
										ref="dialogEditGeneralOldPasswordRef"
										:label="$t('chat.channel.menu.edit.tabs.general.oldPassword')"
									>
										<template v-slot:append>
											<q-icon
												:name="dialogEditGeneralOldPasswordVisible ? 'visibility_off' : 'visibility'"
												class="cursor-pointer"
												@click="dialogEditGeneralOldPasswordVisible = !dialogEditGeneralOldPasswordVisible"
											/>
										</template>
									</q-input>
									<div style="margin-bottom: 1em">
										<q-input
											filled
											class="fill-input"
											:type="dialogEditGeneralNewPasswordVisible ? 'password' : 'text'"
											v-model="dialogEditGeneralNewPassword"
											ref="dialogEditGeneralNewPasswordRef"
											:label="$t('chat.channel.menu.edit.tabs.general.newPassword')"
										>
											<template v-slot:append>
												<q-icon
													:name="dialogEditGeneralNewPasswordVisible ? 'visibility_off' : 'visibility'"
													class="cursor-pointer"
													@click="dialogEditGeneralNewPasswordVisible = !dialogEditGeneralNewPasswordVisible"
												/>
											</template>
										</q-input>
									</div>
								</div>
							</div>
							<div class="row justify-end content-between">
								<q-btn :label="$t('chat.channel.menu.edit.tabs.reset')" color="secondary" @click="editChannelReset" style="margin-right: 2em"/>
								<div style="width:2em"></div>
								<q-btn :label="$t('chat.channel.menu.edit.tabs.apply')" type="submit" color="primary"/>
							</div>
						</q-form>
					</q-tab-panel>
					<q-tab-panel name="users">
						<p>bannedUsers</p>
					</q-tab-panel>
					<q-tab-panel name="mutedUsers">
						<p>muted user</p>
					</q-tab-panel>
					<q-tab-panel name="bannedUsers">
						<p>banned user</p>
					</q-tab-panel>
				</q-tab-panels>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance } from 'axios';
import { QDialog, QMenu, QInput } from 'quasar';
import { io } from 'socket.io-client';
import sanitizeHtml from 'sanitize-html';
import { TypeOfObject } from 'src/boot/typeofData';
import { defineComponent, onMounted, ref, inject } from 'vue';

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
	setup ()
	{
		const socket = io('http://localhost:8080/chat::');
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const typeofObject: TypeOfObject = inject('typeofObject') as TypeOfObject;

		const loading = ref(true);
		const noError = ref(true);
		const channels = ref(new Array<channelInterface>()); // eslint-disable-line no-array-constructor

		// A modifier plus tard
		const userId = ref(Number(localStorage.getItem('chat::user::id')));

		const selectedChannel = ref(0);
		if (localStorage.getItem('chat::channel::id'))
			selectedChannel.value = Number(localStorage.getItem('chat::channel::id'));

		const contextmenu = ref<QMenu | null>(null);
		const contextMenuSelectId = ref(0);
		const contextMenuSelectType = ref();
		const contextMenuSelectPassword = ref();
		const contextMenuSelectName = ref();

		const deleteDialog = ref<QDialog | null>(null);
		const deleteDialogName = ref();
		const deleteDialogConfirm = ref(false);

		const dialogpassword = ref<QDialog | null>(null);
		const selectedChannelError = ref<boolean>(false);
		const selectedChannelPassword = ref(null);
		const selectedChannelId = ref(0);
		const selectedChannelPasswordValue = ref(null);
		const selectedChannelName = ref(null);

		const dialogchannel = ref<QDialog | null>(null);
		const newChannelName = ref(null);
		const newChannelType = ref(null);
		const newChannelPasswordOne = ref(null);
		const newChannelPasswordTwo = ref(null);
		const newChannelError = ref(0);

		const dialogEdit = ref<QDialog | null>(null);
		const dialogEditTab = ref('general');

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
							dialogpassword.value?.show();
						})
						.catch((err) => console.log(err));
				}
			}
			return channelId;
		};

		const openModal = () =>
		{
			if (!dialogchannel.value)
				return;
			dialogchannel.value.show();
		};

		const resetDialog = () =>
		{
			newChannelName.value = null;
			newChannelType.value = null;
			newChannelPasswordOne.value = null;
			newChannelPasswordTwo.value = null;
			newChannelError.value = 0;
		};

		const createChannel = () =>
		{
			if (!newChannelName.value)
			{
				newChannelError.value = 1;
				return;
			}
			if (!newChannelType.value)
			{
				newChannelError.value = 2;
				return;
			}
			if (newChannelType.value === 'protected')
			{
				if (!newChannelPasswordOne.value || !newChannelPasswordTwo.value ||
					newChannelPasswordOne.value !== newChannelPasswordTwo.value
				)
				{
					newChannelError.value = 3;
					return;
				}
			}
			socket.emit('channel::add', {
				id: null,
				creator: Number(localStorage.getItem('chat::user::id')),
				name: sanitizeHtml(newChannelName.value),
				type: sanitizeHtml(newChannelType.value),
				password: newChannelPasswordOne.value
			});
			dialogchannel.value?.hide();
			resetDialog();
		};

		const resetDialogPassword = () =>
		{
			selectedChannelPassword.value = null;
			selectedChannelError.value = false;
		};

		const verifyPassword = () =>
		{
			if (selectedChannelPassword.value !== selectedChannelPasswordValue.value)
				selectedChannelError.value = true;
			else
			{
				sendEvent(selectedChannelId.value);
				dialogpassword.value?.hide();
				resetDialogPassword();
			}
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
							dialogEditGeneralName.value = channel.name;
							contextMenuSelectType.value = channel.type;
							dialogEditGeneralType.value = contextMenuSelectType.value;
							contextMenuSelectPassword.value = channel.password;
							contextMenuSelectName.value = channel.name;
							return;
						}
					}
				}
			}
			contextmenu.value?.hide();
		};

		const deleteChannel = () =>
		{
			if (deleteDialogConfirm.value === false || deleteDialogName.value !== contextMenuSelectName.value)
				return;
			deleteDialog.value?.hide();
			socket.emit('channel::delete', {
				id: contextMenuSelectId.value,
				creator: userId.value,
				name: null,
				type: null,
				password: null
			});
		};

		const deleteDialogHide = () =>
		{
			deleteDialogConfirm.value = false;
			deleteDialogName.value = '';
		};

		// #region Edit Dialog
		const dialogEditGeneralName = ref();
		const dialogEditGeneralType = ref();
		const dialogEditGeneralOldPassword = ref();
		const dialogEditGeneralOldPasswordRef = ref<QInput | null>(null);
		const dialogEditGeneralOldPasswordVisible = ref(true);
		const dialogEditGeneralNewPassword = ref();
		const dialogEditGeneralNewPasswordRef = ref<QInput | null>(null);
		const dialogEditGeneralNewPasswordVisible = ref(true);
		const dialogEditGeneralNameError = ref();
		const dialogEditGeneralSuccess = ref(false);

		const editChannelReset = () =>
		{
			dialogEditGeneralName.value = contextMenuSelectName.value;
			dialogEditGeneralOldPassword.value = null;
			dialogEditGeneralNewPassword.value = null;
			dialogEditGeneralNameError.value = null;
			dialogEditGeneralOldPasswordRef.value?.resetValidation();
			dialogEditGeneralNewPasswordRef.value?.resetValidation();
		};

		const editChannelGeneral = () =>
		{
			if (!dialogEditGeneralName.value)
			{
				dialogEditGeneralNameError.value = 'name';
				return;
			}

			if (dialogEditGeneralType.value === 'protected' &&
				contextMenuSelectType.value !== 'protected' &&
				!dialogEditGeneralNewPassword.value)
			{
				dialogEditGeneralNameError.value = 'toProtected';
				return;
			}

			if (dialogEditGeneralType.value === 'protected')
			{
				if ((dialogEditGeneralOldPassword.value &&
					dialogEditGeneralOldPassword.value !== contextMenuSelectPassword.value))
				{
					dialogEditGeneralNameError.value = 'pass';
					return;
				}
				else if ((dialogEditGeneralOldPassword.value && !dialogEditGeneralNewPassword.value))
				{
					dialogEditGeneralNameError.value = 'passNew';
					return;
				}
			}

			socket.emit('channel::update', {
				id: contextMenuSelectId.value,
				creator: userId.value,
				type: dialogEditGeneralType.value,
				name: dialogEditGeneralName.value,
				password: (dialogEditGeneralNewPassword.value && dialogEditGeneralType.value === 'protected')
					? dialogEditGeneralNewPassword.value
					: null
			});

			dialogEditGeneralNameError.value = null;
			dialogEditGeneralSuccess.value = true;
		};
		// #endregion

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

			socket.on('deleteChannel', (ret) =>
			{
				for (const i in channels.value)
				{
					if (channels.value[i].id === ret.id)
					{
						channels.value.splice(Number(i), 1);
						sendEvent(-1, true);
						break;
					}
				}
			});
		});

		return {
			loading,
			noError,
			channels,
			selectedChannel,

			contextmenu,
			contextMenuSelectId,
			contextMenuSelectType,
			contextMenuSelectName,
			deleteDialog,
			deleteDialogName,
			deleteDialogConfirm,

			deleteDialogHide,

			openContextualMenu,
			editChannelGeneral,

			dialogpassword,
			selectedChannelId,
			selectedChannelError,
			selectedChannelPassword,
			selectedChannelPasswordValue,
			selectedChannelName,

			dialogEdit,
			dialogEditTab,

			dialogEditGeneralName,
			dialogEditGeneralType,
			dialogEditGeneralOldPassword,
			dialogEditGeneralOldPasswordRef,
			dialogEditGeneralOldPasswordVisible,
			dialogEditGeneralNewPassword,
			dialogEditGeneralNewPasswordRef,
			dialogEditGeneralNewPasswordVisible,
			dialogEditGeneralNameError,
			dialogEditGeneralSuccess,
			editChannelReset,
			deleteChannel,

			dialogchannel,
			newChannelName,
			newChannelType,
			newChannelPasswordOne,
			newChannelPasswordTwo,
			newChannelError,
			isPwdOne: ref(true),
			isPwdTwo: ref(true),
			channelIsSelected,
			openModal,
			resetDialog,
			resetDialogPassword,
			createChannel,
			verifyPassword
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
