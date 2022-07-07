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
				<q-tab name="general" icon="settings" :label="$t('chat.channel.menu.edit.tabs.general.title')" />
				<q-tab name="users" icon="groups" :label="$t('chat.channel.menu.edit.tabs.user.title')" />
				<q-tab name="mutedUsers" icon="voice_over_off" :label="$t('chat.channel.menu.edit.tabs.muted.title')" />
				<q-tab name="bannedUsers" icon="person_off" :label="$t('chat.channel.menu.edit.tabs.banned.title')" />
			</q-tabs>
			<q-card-section>
				<q-tab-panels
					v-model="selectedTab"
					animated
					swipeable
					transition-prev="jump-left"
					transition-next="jump-right"
				>
					<q-tab-panel name="general">
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
					<q-tab-panel name="users">
						<q-list>
							<template v-for="user in channel.users" v-bind:key="user.id">
								<DialogEditionUserListVue :user="user" :info="getUser(Number(user.id))" />
							</template>
						</q-list>
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
import { Socket } from 'socket.io-client';
import { QInput, QDialog } from 'quasar';
import { AxiosInstance } from 'axios';
import { TypeOfObject, Timestamp, TimestampFunction } from 'src/boot/libs';
import { defineComponent, ref, reactive, inject, watch } from 'vue';

import DialogEditionUserListVue from './DialogEditionUserList.vue';

interface usersOptionsInterface {
	id: number,
	isCreator: boolean,
	isAdmin: boolean,
	isMuted: boolean,
	isBanned: boolean
}

export default defineComponent({
	name: 'dialog_edition',
	components: {
		DialogEditionUserListVue
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
	emits: ['dialog-edition-hide'],
	setup (props, { emit })
	{
		const socket: Socket = inject('socketChat') as Socket;
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const typeofObject: TypeOfObject = inject('typeofObject') as TypeOfObject;
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
				if (muted.id === id)
					return (compareDate(currentDate, timestamp(muted.until)) !== 0);
			}
			return false;
		};

		const isBanned = (id: number) =>
		{
			const currentDate = generateDate();
			for (const banned of channel.value.bannedUsers)
			{
				if (banned.id === id)
					return (compareDate(currentDate, timestamp(banned.until)) !== 0);
			}
			return false;
		};

		const getUsers = async () =>
		{
			api.get(`/chat/channel/get/no-messages/${props.channelId}`)
				.then(async (res) =>
				{
					if (typeofObject(res.data) !== 'object')
						throw new Error();
					loading.value = false;
					channel.value = res.data.channel;
					for (const i in channel.value.users)
					{
						usersOptions.push({
							id: channel.value.users[i].id,
							isCreator: isCreator(channel.value.users[i].id),
							isAdmin: isAdministrator(channel.value.users[i].id),
							isMuted: isMuted(channel.value.users[i].id),
							isBanned: isBanned(channel.value.users[i].id)
						});
					}
				})
				.catch(() =>
				{
					loading.value = false;
				});
		};

		const getUser = (id: number) =>
		{
			const ret: usersOptionsInterface = {
				id: -1,
				isCreator: false,
				isAdmin: false,
				isMuted: false,
				isBanned: false
			};
			usersOptions.forEach((el) =>
			{
				if (el.id === id)
				{
					ret.id = el.id;
					ret.isAdmin = el.isAdmin;
					ret.isBanned = el.isBanned;
					ret.isCreator = el.isCreator;
					ret.isMuted = el.isMuted;
					return el;
				}
			});
			return ret;
		};
		// #endregion

		const reset = () =>
		{
			selectedTab.value = 'general';
			generalReset();
			emit('dialog-edition-hide');
			dialog.value?.hide();
		};

		watch(() => props.dialogEditionShow, (after, before) =>
		{
			if (before === false && after === true)
			{
				getUsers();
				generalName.value = props.channelName;
				generalType.value = props.channelType;
				dialog.value?.show();
			}
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
			// #region User tab
			getUser,
			// #endregion User tab
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
</style>
