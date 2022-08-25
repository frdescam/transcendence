<template>
	<div class="q-pa-md q-gutter-sm">
		<q-dialog
			ref="dialog"
			model="fixed"
			square
			persistent
			@hide="reset"
		>
			<q-card style="width: 700px; max-width: 80vw;">
				<q-card-section class="row items-center q-pb-none">
					<span class="text-h6 row justify-center modal-creator-title">{{ $t('chat.channel.invitation.creator.title') }}</span>
				</q-card-section>
				<q-card-section v-if="!pendingInvitation">
					<div class="column">
						<q-banner v-if="errorType > 0" inline-actions class="text-white bg-red" style="margin-bottom: 1em;">
							<template v-if="errorType === 1">
								{{ $t('chat.channel.invitation.creator.error') }}
							</template>
							<template v-else>
								{{ $t('chat.channel.invitation.creator.unknown') }}
							</template>
						</q-banner>
						<div v-if="isLoading" class="row justify-center" style="margin-bottom: 1em">
							<q-spinner color="primary" size="3em" />
						</div>
						<span style="text-align: center;">{{ $t('chat.channel.invitation.creator.text', { user: invitationName }) }}</span>
						<q-select v-model="selectedMap" :options="selectOptions" :label="$t('chat.channel.invitation.creator.map')"/>
						<div class="row justify-evenly modal-creator-button">
							<q-btn push color="red-7" round icon="close" @click="selected(false)" />
							<q-btn push color="green-7" round icon="done" @click="selected(true)" />
						</div>
					</div>
				</q-card-section>
				<q-card-section v-else>
					<div v-if="isAccepted === null" class="column" style="align-items: center">
						<span class="text-h6 center">{{ $t('chat.channel.invitation.creator.pending', { user: invitationName })}}</span>
						<q-spinner-dots color="blue" size="2.5em" />
					</div>
					<div class="column" v-else>
						<span v-if="isAccepted === true" class="modal-creator-text-align">{{ $t('chat.channel.invitation.creator.accepted', { user: invitationName }) }}</span>
						<span v-else class="modal-creator-text-align">{{ $t('chat.channel.invitation.creator.refused', { user: invitationName }) }}</span>
						<div class="row justify-center" style="margin-top: 1em">
							<q-btn class="btn-fixed-width" color="secondary" :label="$t('chat.channel.invitation.creator.close')" icon="close" @click="close"/>
						</div>
					</div>
				</q-card-section>
			</q-card>
		</q-dialog>
	</div>
</template>

<script lang="ts">
import { QDialog } from 'quasar';
import { AxiosInstance } from 'axios';
import { Socket } from 'socket.io-client';
import { useRouter } from 'vue-router';
import { defineComponent, ref, inject, watch } from 'vue';
import maps from 'src/common/game/maps/index';

let timeout: NodeJS.Timeout; // eslint-disable-line no-undef

export default defineComponent({
	name: 'chat_invitation_creator',
	props: {
		dialogInvitationCreatorShow: Boolean,
		creatorId: Number,
		creatorName: String,
		invitationId: Number,
		invitationName: String
	},
	emits: ['dialog-invitation-close'],
	beforeUnmount: () => clearTimeout(timeout),
	setup: (props, { emit }) =>
	{
		const axios: AxiosInstance = inject('api') as AxiosInstance;
		const socket: Socket = inject('socketChat') as Socket;
		const router = useRouter();

		const dialog = ref<QDialog | null>(null);
		const isLoading = ref(false);
		const isError = ref(false);
		const errorType = ref(0);
		const selectedMap = ref();
		const selectOptions: string[] = [];
		const gameLink = ref<string | null>();

		const pendingInvitation = ref(false);
		const isAccepted = ref<boolean | null>(null);

		for (const key in maps)
			selectOptions.push(key);
		selectedMap.value = selectOptions[0];

		const selected = (val: boolean) =>
		{
			if (val)
			{
				isError.value = false;
				isLoading.value = true;
				errorType.value = 0;

				isLoading.value = false;
				gameLink.value = String('toto');
				socket.emit('invitation::send', {
					creatorId: props.creatorId,
					creatorName: props.creatorName,
					invitationId: props.invitationId,
					invitationName: props.invitationName,
					gameLink: gameLink.value
				});
				pendingInvitation.value = true;
			/*
				axios.post('party', {
					adversary: props.invitationId,
					map: selectedMap.value
				}).then((ret) =>
				{
					isLoading.value = false;
					gameLink.value = String(ret);
					socket.emit('invitation::send', {
						creatorId: props.creatorId,
						creatorName: props.creatorName,
						invitationId: props.invitationId,
						invitationName: props.invitationName,
						gameLink: gameLink.value
					});
					pendingInvitation.value = true;
				}).catch((err) =>
				{
					isLoading.value = false;
					isError.value = true;
					if (err.response.status === 403)
						errorType.value = 1;
					else
						errorType.value = 2;
				});
				*/
			}
			else
			{
				emit('dialog-invitation-close', false);
				dialog.value?.hide();
			}
		};
		socket.on('invitation::receive::approval', (ret) =>
		{
			if (ret.data.creatorId === props.creatorId &&
				ret.data.invitationId === props.invitationId &&
				ret.data.gameLink === gameLink.value)
			{
				isAccepted.value = (ret.data.approvalFromInvitedUser && ret.data.approvalFromInvitedUser === true);
				timeout = setTimeout(() =>
				{
					close();
				}, 5 * 1000);
			}
		});

		const close = () =>
		{
			dialog.value?.hide();
			emit('dialog-invitation-close', false);
			if (isAccepted.value)
				router.push(`play/${gameLink.value}`);
		};

		const reset = () =>
		{
			isLoading.value = false;
			isError.value = false;
			errorType.value = 0;
			selectedMap.value = selectOptions[0];
			gameLink.value = '';
			pendingInvitation.value = false;
			isAccepted.value = null;
		};

		watch(() => props.dialogInvitationCreatorShow, (after, before) =>
		{
			if (before === false && after === true)
				dialog.value?.show();
		});

		return {
			dialog,
			isLoading,
			isError,
			errorType,
			selectOptions,
			selectedMap,

			pendingInvitation,
			isAccepted,

			selected,
			close,
			reset
		};
	}
});
</script>

<style>
	.modal-creator-title {
		width: 100%;
	}
	.modal-creator-button {
		margin-top: 1.5em;
	}
	.modal-creator-text-align {
		text-align: center;
	}
</style>
