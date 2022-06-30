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
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosInstance } from 'axios';
import { QDialog } from 'quasar';
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
		const userId = ref(Number(localStorage.getItem('chat::user::id')));
		const selectedChannel = ref(0);

		if (localStorage.getItem('chat::channel::id'))
			selectedChannel.value = Number(localStorage.getItem('chat::channel::id'));

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

		const sendEvent = (channelId: number) =>
		{
			selectedChannel.value = channelId;
			localStorage.setItem('chat::channel::id', channelId.toString(10));
			window.dispatchEvent(
				new CustomEvent('chatChannelSelected',
					{
						bubbles: true,
						cancelable: true,
						composed: true,
						detail: {
							channelId
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
				console.log(ret);
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
		});

		return {
			loading,
			noError,
			channels,
			selectedChannel,

			dialogpassword,
			selectedChannelId,
			selectedChannelError,
			selectedChannelPassword,
			selectedChannelPasswordValue,
			selectedChannelName,

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
</style>
