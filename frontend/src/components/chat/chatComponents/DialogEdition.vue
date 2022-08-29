<template>
	<q-dialog
		ref="dialog"
		model="medium"
		square
		@hide="reset"
	>
		<q-card style="width: 700px; max-width: 80vw">
			<q-tabs
				dense
				align="justify"
				class="bg-primary text-white shadow-2"
				:breakpoint="0"
				v-model="selectedTab"
			>
				<q-tab v-if="isCreator(Number(userId))" name="general" icon="settings" :label="$t('chat.channel.menu.edit.tabs.general.title')" />
				<q-tab name="users" icon="groups" :label="$t('chat.channel.menu.edit.tabs.user.title')" />
			</q-tabs>
			<q-card-section style="max-height: 50vh; padding: 0" class="scroll">
				<q-tab-panels
					v-model="selectedTab"
					animated
					swipeable
					transition-prev="jump-left"
					transition-next="jump-right"
				>
					<q-tab-panel v-if="isCreator(Number(userId))" name="general">
						<q-banner v-if="generalNameError" class="bg-red text-white">
							{{ $t(`chat.channel.menu.edit.tabs.general.error.${generalNameError}`) }}
						</q-banner>
						<q-banner v-if="generalSuccess" class="bg-green text-white">
							{{ $t('chat.channel.menu.edit.tabs.general.success') }}
						</q-banner>
						<q-form
							@submit="editGeneral"
						>
							<div class="row no-wrap items-center tab-row">
								<div class="row no-wrap items-center is-general">
									<q-icon name="info" size="2em"></q-icon>
									<span class="text-h6">{{ $t('chat.channel.menu.edit.tabs.general.type') }}</span>
								</div>
								<q-option-group
									v-model="generalType"
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
									v-model="generalName"
									:label="$t('chat.channel.menu.edit.tabs.general.name')"
									:rules="[(val: string) => val && val.length > 0 || `${$t('chat.channel.menu.edit.tabs.general.name')} ${$t('chat.channel.menu.edit.tabs.need')}`]"
								></q-input>
							</div>
							<div
								v-if="generalType === 'protected'"
								class="row no-wrap items-center tab-row"
							>
								<div class="row no-wrap items-center is-input">
									<q-icon name="key" size="2em"></q-icon>
									<span class="text-h6">{{ $t('chat.channel.menu.edit.tabs.general.password') }}</span>
								</div>
								<div class="fill-input">
									<q-input
										v-if="channelType === 'protected'"
										filled
										style="margin-bottom: 2em"
										class="fill-input"
										:type="generalOldPasswordVisible ? 'password' : 'text'"
										v-model="generalOldPassword"
										ref="generalOldPasswordRef"
										:label="$t('chat.channel.menu.edit.tabs.general.oldPassword')"
									>
										<template v-slot:append>
											<q-icon
												:name="generalOldPasswordVisible ? 'visibility_off' : 'visibility'"
												class="cursor-pointer"
												@click="generalOldPasswordVisible = !generalOldPasswordVisible"
											/>
										</template>
									</q-input>
									<div style="margin-bottom: 1em">
										<q-input
											filled
											class="fill-input"
											:type="generallNewPasswordVisible ? 'password' : 'text'"
											v-model="generalNewPassword"
											ref="generallNewPasswordRef"
											:label="$t('chat.channel.menu.edit.tabs.general.newPassword')"
										>
											<template v-slot:append>
												<q-icon
													:name="generallNewPasswordVisible ? 'visibility_off' : 'visibility'"
													class="cursor-pointer"
													@click="generallNewPasswordVisible = !generallNewPasswordVisible"
												/>
											</template>
										</q-input>
									</div>
								</div>
							</div>
							<div class="row justify-end content-between">
								<q-btn :label="$t('chat.channel.menu.edit.tabs.reset')" color="secondary" @click="generalReset" style="margin-right: 2em"/>
								<div style="width:2em"></div>
								<q-btn :label="$t('chat.channel.menu.edit.tabs.apply')" type="submit" color="primary"/>
							</div>
						</q-form>
					</q-tab-panel>
					<q-tab-panel name="users" class="user-list">
						<div class="user-list-search">
							<q-input bottom-slots v-model="searchUser" :label="$t('chat.channel.menu.edit.tabs.user.tooltip.search')">
								<template v-slot:append>
									<q-icon v-if="searchUser" name="close" @click="searchUser = ''" class="cursor-pointer" />
									<q-icon name="search" />
								</template>
							</q-input>
							<div class="row justify-center">
								<q-btn v-if="isCreator(Number(userId))"
									round
									flat
									icon="add_circle_outline"
									size="1.3em"
									@click="dialogEditionAddUserShow = true"
								>
									<q-tooltip
										anchor="top middle"
										:offset="[0, 35]"
									>
										{{ $t('chat.channel.menu.edit.tabs.user.tooltip.addUser') }}
									</q-tooltip>
								</q-btn>
							</div>
						</div>
						<q-list class="user-list-users" v-if="loading === false" ref="userList">
							<template v-for="user in channel.users" v-bind:key="user.id">
								<DialogEditionUserListVue
									v-if="(searchUser && search(user.pseudo)) || !searchUser"
									:user="user"
									:errorOccur="dialogEditionListError"
									:info="getUser(Number(user.id))"
									:connectedUser="getUser(Number(userId))"
									@dialog-edition-users-admin="toggleAdmin"
									@dialog-edition-users-delete="deleteUser"
									@dialog-edition-users-timepicker="toggleChangeState"
								/>
							</template>
							<q-dialog
								ref="timepicker"
								model="fullWidth"
								square
								full-width
								persistent
							>
								<q-card>
									<q-card-section>
										<div class="text-h6 text-center">
											{{ $t(`chat.channel.menu.edit.tabs.user.timepicker.${timepickerType}`) }}
										</div>
										<q-banner v-if="timepickerError" inline-actions class="text-white bg-red">
											{{ $t('chat.channel.menu.edit.tabs.user.error.time') }}
										</q-banner>
									</q-card-section>
									<q-card-section class="row no-wrap justify-evenly">
										<q-date v-model="timepickerDate" mask="YYYY-MM-DD HH:mm" />
										<q-time v-model="timepickerDate" mask="YYYY-MM-DD HH:mm" />
									</q-card-section>
									<q-card-actions align="right" class="text-primary">
										<q-btn outline
											color="secondary"
											:label="$t('chat.channel.menu.edit.tabs.reset')"
											@click="defineTimepickerValue"
										/>
										<q-btn flat
											color="red-6"
											:label="$t('chat.channel.menu.delete.cancel')"
											@click="cancelTimepicker"
											v-close-popup
										/>
										<q-btn flat
											:label="$t('chat.channel.menu.edit.tabs.user.apply')"
											@click="submitTimepicker"
										/>
									</q-card-actions>
								</q-card>
							</q-dialog>
							<DialogEditionAddUser
								:presentUser="channel.users"
								:error="dialogEditionAddUserError"
								:dialog-edition-add-user-show="dialogEditionAddUserShow"
								@dialog-edition-users-close="dialogEditionAddUserShow = false; dialogEditionAddUserError = false"
								@dialog-edition-users-add="addUserToChannel"
							/>
						</q-list>
					</q-tab-panel>
				</q-tab-panels>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { Socket } from 'socket.io-client';
import { QInput, QDialog, QList } from 'quasar';
import { Timestamp, TimestampFunction } from 'src/boot/libs';
import { defineComponent, ref, reactive, inject, watch } from 'vue';

import DialogEditionUserListVue from './DialogEditionUserList.vue';
import DialogEditionAddUser from './DialogEditionAddUser.vue';

interface usersOptionsInterface {
	id: number,
	isCreator: boolean,
	isAdmin: boolean,
	bannedKey: number,
	bannedId: number,
	isBanned: boolean,
	mutedKey: number,
	mutedId: number,
	isMuted: boolean
}

interface userListError {
	id: number,
	type: string
}

export default defineComponent({
	name: 'dialog_edition',
	components: {
		DialogEditionUserListVue,
		DialogEditionAddUser
	},
	props: {
		dialogEditionShow: Boolean,
		channelId: Number,
		channelName: String,
		channelType: String,
		channelPassword: String,
		channelOwner: Number,
		userId: Number
	},
	emits: [
		'dialog-edition-alert',
		'dialog-edition-update-user',
		'dialog-edition-hide'
	],
	setup (props, { emit })
	{
		const socket: Socket = inject('socketChat') as Socket;
		const timestamp: TimestampFunction = inject('timestamp') as TimestampFunction;

		const loading = ref(true);
		const channel = ref();
		const usersOptions = reactive<usersOptionsInterface []>([]);
		const dialog = ref<QDialog | null>(null);
		const selectedTab = ref('general');

		// #region General
		const generalName = ref();
		const generalType = ref();
		const generalOldPassword = ref();
		const generalOldPasswordRef = ref<QInput | null>(null);
		const generalOldPasswordVisible = ref(true);
		const generalNewPassword = ref();
		const generallNewPasswordRef = ref<QInput | null>(null);
		const generallNewPasswordVisible = ref(true);
		const generalNameError = ref();
		const generalSuccess = ref(false);

		const generalReset = () =>
		{
			generalName.value = props.channelName;
			generalType.value = props.channelType;
			generalNameError.value = null;
			generalSuccess.value = false;
			generalOldPassword.value = null;
			generalNewPassword.value = null;
			generalOldPasswordRef.value?.resetValidation();
			generallNewPasswordRef.value?.resetValidation();
		};

		const editGeneral = () =>
		{
			if (!generalName.value)
			{
				generalNameError.value = 'name';
				return;
			}

			if (props.channelType !== 'protected' &&
				generalType.value === 'protected' &&
				!generalNewPassword.value)
			{
				generalNameError.value = 'toProtected';
				return;
			}

			if (generalType.value === 'protected' && generalOldPassword.value)
			{
				if (!generalOldPassword.value || (generalOldPassword.value !== props.channelPassword))
				{
					generalNameError.value = 'pass';
					return;
				}
				if (!generalNewPassword.value)
				{
					generalNameError.value = 'passNew';
					return;
				}
				if (generalOldPassword.value === generalNewPassword.value)
				{
					generalNameError.value = 'same';
					return;
				}
			}
			socket.emit('channel::update', {
				id: props.channelId,
				creator: props.userId,
				type: generalType.value,
				name: generalName.value,
				password: (generalNewPassword.value && generalType.value === 'protected')
					? generalNewPassword.value
					: null
			});
			generalNameError.value = null;
			generalSuccess.value = true;
		};
		// #endregion

		// #region User
		const generateDate = (): Timestamp =>
		{
			const __temp = new Date();
			const currentDate: Timestamp = {
				year: __temp.getUTCFullYear(),
				month: __temp.getUTCMonth(),
				day: __temp.getUTCDay(),
				hour: __temp.getUTCHours(),
				minute: __temp.getUTCMinutes(),
				second: __temp.getUTCSeconds(),
				millisecond: __temp.getUTCMilliseconds()
			};
			return currentDate;
		};

		const compareDate = (a: Timestamp, b: Timestamp) =>
		{
			let result: number;
			result = a.year = b.year;
			if (result !== 0) return result;
			result = a.month = b.month;
			if (result !== 0) return result;
			result = a.day = b.day;
			if (result !== 0) return result;
			result = a.hour = b.hour;
			if (result !== 0) return result;
			result = a.minute = b.minute;
			if (result !== 0) return result;
			result = a.second = b.second;
			if (result !== 0) return result;
			result = a.millisecond = b.millisecond;
			return result;
		};

		const isCreator = (id: number) => id === props.channelOwner;

		const isAdministrator = (id: number) =>
		{
			for (const administrator of channel.value.admins)
			{
				if (administrator.id === id)
					return true;
			}
			return false;
		};

		const isMuted = (id: number) =>
		{
			const currentDate = generateDate();
			for (const muted of channel.value.mutedUsers)
			{
				if (muted.user.id === id)
				{
					return ({
						key: muted.id,
						id,
						compare: (compareDate(currentDate, timestamp(muted.until)) !== 0)
					});
				}
			}
			return ({
				key: -1,
				id,
				compare: false
			});
		};

		const isBanned = (id: number) =>
		{
			const currentDate = generateDate();
			for (const banned of channel.value.bannedUsers)
			{
				if (banned.user.id === id)
				{
					return ({
						key: banned.id,
						id,
						compare: compareDate(currentDate, timestamp(banned.until)) !== 0
					});
				}
			}
			return ({
				key: -1,
				id,
				compare: false
			});
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const addUserOption = (user: any) =>
		{
			const banned = isBanned(user.id);
			const muted = isMuted(user.id);
			usersOptions.push({
				id: user.id,
				isCreator: isCreator(user.id),
				isAdmin: isAdministrator(user.id),
				bannedKey: banned.key,
				bannedId: banned.id,
				isBanned: banned.compare,
				mutedKey: muted.key,
				mutedId: muted.id,
				isMuted: muted.compare
			});
		};

		const getChannel = () =>
		{
			loading.value = true;
			socket.emit('channel::get', props.channelId);
		};

		socket.on('channel::receive::get', (ret) =>
		{
			if (!ret)
				loading.value = false;
			else if (ret.socketId === socket.id)
			{
				loading.value = false;
				channel.value = ret.data;
				usersOptions.length = 0;
				if (channel.value === undefined)
					return;
				for (const i in channel.value.users)
					addUserOption(channel.value.users[i]);
			}
		});

		const getUser = (id: number) =>
		{
			for (const i in usersOptions)
			{
				if (usersOptions[i].id === id)
					return usersOptions[i];
			}
			return {
				id: -1,
				isCreator: false,
				isAdmin: false,
				bannedKey: -1,
				bannedId: -1,
				isBanned: false,
				mutedKey: -1,
				mutedId: -1,
				isMuted: false
			};
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const switchVal = (type: string, val: boolean, ret: any) =>
		{
			const __ret = (option: usersOptionsInterface, _type: string, _val: boolean) =>
			{
				const ret = {
					userId: option.id,
					admin: option.isAdmin,
					muted: option.isMuted,
					banned: option.isBanned,
					deleted: (_type === 'deleted')
				};
				emit('dialog-edition-alert', props.channelId, option.id, _type, _val);
				emit('dialog-edition-update-user', props.channelId, ret);
				socket.emit('channel::data::change', props.channelId, ret);
			};

			if (ret.channel !== props.channelId)
				return;
			for (const i in usersOptions)
			{
				if (usersOptions[i].id === ret.user)
				{
					if (type === 'banned')
					{
						usersOptions[i].bannedKey = ret.id;
						usersOptions[i].isBanned = val;
						__ret(usersOptions[i], 'banned', val);
					}
					else if (type === 'muted')
					{
						usersOptions[i].mutedKey = ret.id;
						usersOptions[i].isMuted = val;
						__ret(usersOptions[i], 'muted', val);
					}
					else if (type === 'admin')
					{
						usersOptions[i].isAdmin = val;
						__ret(usersOptions[i], 'admin', val);
					}
					return;
				}
			}
		};

		const addUserToChannel = (userId: number) =>
		{
			socket.emit('channel::user::add', {
				channelId: props.channelId,
				userId
			});
		};
		socket.on('channel::user::receive::add', (ret) =>
		{
			if (ret.data.channel !== props.channelId)
				return;
			if (ret.data.added === true)
			{
				getChannel();
				dialogEditionAddUserShow.value = false;
			}
			else
				dialogEditionAddUserError.value = true;
		});
		// #endregion

		// #region Cron task for remove ban/mute user
		socket.on('banned::cron::delete', (ret) =>
		{
			if (!ret || props.dialogEditionShow === false || props.channelId !== ret.channel)
				return;
			for (const i in usersOptions)
			{
				if (usersOptions[i].id === ret.user)
				{
					usersOptions[i].bannedKey = -1;
					usersOptions[i].isBanned = false;
					break;
				}
			}
		});

		socket.on('muted::cron::delete', (ret) =>
		{
			if (!ret || props.dialogEditionShow === false || props.channelId !== ret.channel)
				return;
			for (const i in usersOptions)
			{
				if (usersOptions[i].id === ret.user)
				{
					usersOptions[i].mutedKey = -1;
					usersOptions[i].isMuted = false;
					break;
				}
			}
		});
		// #endregion Cron task for remove ban or mute user

		// #region Delete user
		const userList = ref<QList | null>(null);
		const deleteUser = (id: number) =>
		{
			const __node = [...userList.value?.$el.childNodes];
			for (const el of __node)
			{
				if (el.nodeName === 'DIV' && Number(el.getAttribute('data-userid')) === id)
				{
					el.remove();
					socket.emit('channel::user::remove', {
						userId: id,
						channelId: props.channelId
					});
					return;
				}
			}
		};
		socket.on('channel::user::receive::remove', (ret) =>
		{
			if (ret.data.channel !== props.channelId)
				return;
			if (channel.value === undefined)
				return;

			for (const i in channel.value.users)
			{
				if (channel.value.users[i].id === ret.data.data.id)
				{
					channel.value.users.splice(i, 1);
					break;
				}
			}
			for (const i in channel.value.admins)
			{
				if (channel.value.admins[i].id === ret.data.data.id)
				{
					channel.value.admins.splice(i, 1);
					break;
				}
			}
			for (const i in channel.value.mutedUsers)
			{
				if (channel.value.mutedUsers[i].user.id === ret.data.data.id)
				{
					channel.value.mutedUsers.splice(i, 1);
					break;
				}
			}
			for (const i in channel.value.bannedUsers)
			{
				if (channel.value.bannedUsers[i].user.id === ret.data.data.id)
				{
					channel.value.bannedUsers.splice(i, 1);
					break;
				}
			}
		});
		// #endregion

		// #region Search user
		const dialogEditionAddUserError = ref(false);
		const dialogEditionAddUserShow = ref(false);
		const searchUser = ref();

		const search = (value: string) =>
		{
			if (value.toLowerCase().indexOf(searchUser.value.toLowerCase()) > -1)
				return true;
			return false;
		};
		// #endregion

		// #region Admin
		const toggleAdmin = (userId: number, value: boolean) =>
		{
			if (value === true)
			{
				socket.emit('admin::set', {
					channelId: props.channelId,
					userId
				});
			}
			else
			{
				socket.emit('admin::delete', {
					channelId: props.channelId,
					userId
				});
			}
		};
		socket.on('admin::receive::set', (ret) =>
		{
			if (ret.data.added === true)
				switchVal('admin', true, ret.data);
		});
		socket.on('admin::receive::delete', (ret) =>
		{
			if (ret.data.deleted === true)
				switchVal('admin', false, ret.data);
		});
		// #endregion

		// #region Timepicker
		const dialogEditionListError = ref<userListError>();
		const timepicker = ref<QDialog | null>(null);
		const timepickerError = ref<boolean>(false);
		const timepickerDate = ref<string>();
		const timepickerKey = ref<number>();
		const timepickerId = ref<number>();
		const timepickerType = ref<string>();

		const defineTimepickerValue = () =>
		{
			const time = timestamp(new Date().toISOString());
			const addPadding = (time: number) => (time < 10) ? `0${time}` : String(time);
			timepickerDate.value = `${time.year}-${addPadding(time.month)}-${addPadding(time.day)} ${addPadding(time.hour)}:${addPadding(time.minute)}`;
		};

		const toggleChangeState = (
			key: number,
			userId: number,
			value: boolean,
			type: string
		) =>
		{
			if (value === true)
			{
				defineTimepickerValue();
				timepickerKey.value = key;
				timepickerId.value = userId;
				timepickerType.value = type;
				timepicker.value?.show();
				return;
			}
			socket.emit(`${type}::delete`, {
				id: key,
				userId,
				channelId: props.channelId,
				until: undefined
			});
		};

		const cancelTimepicker = () =>
		{
			for (const x in channel.value.users)
			{
				if (channel.value.users[x].id === timepickerId.value)
				{
					dialogEditionListError.value = {
						id: Number(timepickerId.value),
						type: String(timepickerType.value)
					};
					return;
				}
			}
		};

		const submitTimepicker = () =>
		{
			const dateParse = /^(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2}) (?<hour>[0-9]{2}):(?<minute>[0-9]{2})$/.exec(String(timepickerDate.value));
			if (!dateParse || !dateParse.groups)
				return;
			const date = new Date(`${dateParse.groups.year}-${dateParse.groups.month}-${dateParse.groups.day}T${dateParse.groups.hour}:${dateParse.groups.minute}:00.000Z`);
			const curDate = new Date();
			if (curDate.getTime() >= date.getTime())
			{
				timepickerError.value = true;
				return;
			}
			socket.emit(`${timepickerType.value}::set`, {
				id: undefined,
				userId: timepickerId.value,
				channelId: props.channelId,
				until: date
			});
			timepicker.value?.hide();
		};

		socket.on('banned::receive::set', (ret) =>
		{
			if (ret.data.set === true)
				switchVal('banned', true, ret.data);
		});
		socket.on('banned::receive::delete', (ret) =>
		{
			if (ret.data.deleted === true)
				switchVal('banned', false, ret.data);
		});
		socket.on('muted::receive::set', (ret) =>
		{
			if (ret.data.set === true)
				switchVal('muted', true, ret.data);
		});
		socket.on('muted::receive::delete', (ret) =>
		{
			if (ret.data.deleted === true)
				switchVal('muted', false, ret.data);
		});
		// #endregion

		const reset = () =>
		{
			selectedTab.value = 'general';
			generalReset();
			emit('dialog-edition-hide');
			dialog.value?.hide();
		};

		watch(() => props.dialogEditionShow, (after) =>
		{
			if (after === true)
			{
				getChannel();
				selectedTab.value = isCreator(Number(props.userId)) ? 'general' : 'users';
				generalName.value = props.channelName;
				generalType.value = props.channelType;
				dialog.value?.show();
			}
			else
				dialog.value?.hide();
		});

		return {
			loading,
			channel,
			dialog,
			selectedTab,

			// #region General tab
			generalName,
			generalType,
			generalOldPassword,
			generalOldPasswordRef,
			generalOldPasswordVisible,
			generalNewPassword,
			generallNewPasswordRef,
			generallNewPasswordVisible,
			generalNameError,
			generalSuccess,
			editGeneral,
			// #endregion

			// #region Search user
			dialogEditionAddUserError,
			dialogEditionAddUserShow,
			searchUser,
			search,
			addUserToChannel,
			// #endregion

			// #region Delete user
			userList,
			deleteUser,
			// #endregion

			// #region User tab
			dialogEditionListError,
			isCreator,
			getUser,
			// #endregion User tab

			// #region Admin
			toggleAdmin,
			// #endregion Admin

			// #region Timepicker
			timepicker,
			timepickerError,
			timepickerDate,
			timepickerType,
			defineTimepickerValue,
			toggleChangeState,
			cancelTimepicker,
			submitTimepicker,
			// #endregion Timepicker

			generalReset,
			reset
		};
	}
});
</script>

<style>
.overflow-text {
	max-width: 7em;
}
.badge-parent {
	max-width: max-content;
}
.badge {
	width: fit-content;
	margin-bottom: .2em;
}
.sep {
	margin-right: .5em;
	max-width: 100px;
}
.toggle-section {
	display: flex;
	flex-direction: column;
	width: fit-content;
	padding: 0 .5em;
}
.option-section {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	flex-wrap: nowrap;
}
.toggle-section > span {
	text-align: center;
}

.user-list-tab {
	height:46vh; padding: 1em
}
.user-list {
	height: 46vh !important;
	padding: 0;
	display: flex;
	flex-direction: column;
}
.user-list-search {
	padding: 1em 1em 0 1em;
}
.user-list-users {
	overflow: auto;
	padding: 0 1em;;
}
</style>
