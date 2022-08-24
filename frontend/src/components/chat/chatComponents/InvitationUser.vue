<template>
	<q-dialog
		ref="dialog"
		model="fixed"
		square
	>
		<q-card>
			<q-card-section class="row items-center q-pb-none">
				<span class="text-h6">{{ $t('chat.channel.invitation.player.title', { create: data?.creatorName }) }}</span>
				<q-space />
				<q-btn icon="close" flat round dense v-close-popup />
			</q-card-section>
			<q-card-section>
				<div class="column">
					<span>{{ $t('chat.channel.invitation.player.title') }}</span>
					<div class="row justify-evenly">
						<q-btn push color="red-7" round icon="close" @click="accept(false)" />
						<q-btn push color="green-7" round icon="done" @click="accept(true)" />
					</div>
				</div>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { QDialog } from 'quasar';
import { Socket } from 'socket.io-client';
import { useRouter } from 'vue-router';
import { defineComponent, ref, inject, watch } from 'vue';

interface receiveInvitation {
  creatorId: number,
  creatorName: string,
  invitationId: number,
  invitationName: string,
  gameLink: string,
  approvalFromInvitedUser?: boolean
}

export default defineComponent({
	name: 'chat_invitation_user',
	props: {
		userId: Number
	},
	setup: (props) =>
	{
		const socket: Socket = inject('socketChat') as Socket;
		const router = useRouter();

		const dialog = ref<QDialog | null>(null);
		const data = ref<receiveInvitation>();

		const accept = (val: boolean) =>
		{
			socket.emit('invitation::approval', {
				creatorId: data.value?.creatorId,
				creatorName: data.value?.creatorName,
				invitationId: data.value?.invitationId,
				invitationName: data.value?.invitationName,
				gameLink: data.value?.gameLink,
				approvalFromInvitedUser: val
			});
			dialog.value?.hide();
			if (val === true)
				router.push(`play/${data.value?.gameLink}`);
		};

		socket.on('invitation::receive::send', (ret: receiveInvitation) =>
		{
			if (ret.invitationId === props.userId)
				data.value = ret;
		});
		watch(() => data, () =>
		{
			dialog.value?.show();
		}, { deep: true });

		return {
			dialog,
			data,
			accept
		};
	}
});
</script>
