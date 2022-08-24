<template>
	<q-dialog
		ref="dialog"
		model="fixed"
		square
		@hide="reset"
	>
		<q-card>
			<q-card-section class="row items-center q-pb-none">
				<span class="text-h6">{{ $t('chat.channel.invitation.creator.title', { user: invitationName }) }}</span>
				<q-space />
				<q-btn icon="close" flat round dense v-close-popup />
			</q-card-section>
			<q-card-section v-if="!pendingInvitation">
				<div class="column">
					<q-banner v-if="errorType > 0" inline-actions class="text-white bg-red">
						<template v-if="errorType === 1">
							{{ $t('chat.channel.invitation.creator.error') }}
						</template>
						<template v-else>
							{{ $t('chat.channel.invitation.creator.unknown') }}
						</template>
					</q-banner>
					<q-spinner
						v-if="isLoading"
						color="primary"
						size="3em"
					/>
					<span>{{ $t('chat.channel.invitation.creator.text') }}</span>
					<q-select v-model="selectedMap" :options="selectOptions" :label="$t('chat.channel.invitation.creator.map')"/>
					<div class="row justify-evenly">
						<q-btn push color="red-7" round icon="close" @click="selected(false)" />
						<q-btn push color="green-7" round icon="done" @click="selected(true)" />
					</div>
				</div>
			</q-card-section>
			<q-card-section v-else>
				<div class="column" v-if="isAccepted === null">
					<span class="text-h6 center">{{ $t('chat.channel.invitation.creator.pending')}}</span>
					<q-spinner-dots color="indigo" />
				</div>
				<div class="column" v-else>
					<span v-if="isAccepted === true">{{ $t('chat.channel.invitation.creator.accepted') }}</span>
					<span v-else>{{ $t('chat.channel.invitation.creator.refused') }}</span>
					<q-btn align="around" class="btn-fixed-width" color="secondary" :label="$t('chat.channel.invitation.creator.close')" icon="close" @click="close"/>
				</div>
			</q-card-section>
		</q-card>
	</q-dialog>
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
	beforeUnmount: () => clearTimeout(timeout),
	setup: (props) =>
	{
		const axios: AxiosInstance = inject('api') as AxiosInstance;
		const socket: Socket = inject('socketChat') as Socket;
		const router = useRouter();

		const dialog = ref<QDialog | null>(null);
		const isLoading = ref(false);
		const isError = ref(false);
		const errorType = ref(0);
		const selectedMap = ref(null);
		const selectOptions: string[] = [];
		const gameLink = ref<string | null>();

		const pendingInvitation = ref(false);
		const isAccepted = ref<boolean | null>(null);

		for (const key in maps)
			selectOptions.push(key);

		const selected = (val: boolean) =>
		{
			if (val)
			{
				isError.value = false;
				isLoading.value = true;
				errorType.value = 0;
				axios.post('party', {
					adversary: props.invitationId,
					map: selectedMap.value
				}).then((ret) =>
				{
					isLoading.value = false;
					gameLink.value = String(ret);
					socket.emit('invitation..send', {
						creatorId: props.creatorId,
						creatorName: props.creatorName,
						invitationId: props.invitationId,
						invitationName: props.invitationName,
						gameLink: ret
					});
					pendingInvitation.value = true;
				}).catch((err) =>
				{
					isLoading.value = false;
					isError.value = true;
					if (err.statusCode === 403)
						errorType.value = 1;
					else
						errorType.value = 2;
				});
			}
		};
		socket.on('invitation::receive::approval', (ret) =>
		{
			if (ret.creatorId === props.creatorId &&
				ret.invitationId === props.invitationId &&
				ret.gameLink === gameLink.value)
			{
				isAccepted.value = (ret.approvalFromInvitedUser && ret.approvalFromInvitedUser === true);
				pendingInvitation.value = false;
				timeout = setTimeout(() =>
				{
					close();
				}, 5 * 1000);
			}
		});

		const close = () =>
		{
			dialog.value?.hide();
			if (isAccepted.value)
				router.push(`play/${gameLink.value}`);
		};

		const reset = () =>
		{
			isError.value = false;
			isLoading.value = true;
			errorType.value = 0;
			pendingInvitation.value = false;
			isAccepted.value = null;
			gameLink.value = '';
			selectedMap.value = null;
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
