<template>
	<q-dialog
		ref="dialog"
		model="fixed"
		persistent
		square
	>
		<q-card style="width: 700px; max-width: 80vw;">
			<q-card-section class="row items-center q-pb-none">
				<span class="text-h6 modal-invite-user-title">{{ $t('chat.channel.invitation.player.title', { creator: info?.data.creatorName }) }}</span>
			</q-card-section>
			<q-card-section>
				<div class="column">
					<div class="row justify-evenly">
						<q-btn color="red-7" @click="accept(false)">
							<q-icon left size="1.em" name="close"/>
							<div>{{ $t('chat.channel.invitation.player.no') }}</div>
						</q-btn>
						<q-btn color="green-7" @click="accept(true)">
							<q-icon left size="1.em" name="done"/>
							<div>{{ $t('chat.channel.invitation.player.yes') }}</div>
						</q-btn>
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
		const info = ref();

		const accept = (val: boolean) =>
		{
			socket.emit('invitation::approval', {
				creatorId: info.value?.data.creatorId,
				creatorName: info.value?.data.creatorName,
				invitationId: info.value?.data.invitationId,
				invitationName: info.value?.data.invitationName,
				gameLink: info.value?.data.gameLink,
				approvalFromInvitedUser: val
			});
			dialog.value?.hide();
			if (val === true)
				router.push(`play/${info.value?.data.gameLink}`);
		};

		socket.on('invitation::receive::send', (ret) =>
		{
			if (ret.data.invitationId === props.userId)
				info.value = ret;
		});
		watch(() => info, () =>
		{
			dialog.value?.show();
		}, { deep: true });

		return {
			dialog,
			info,
			accept
		};
	}
});
</script>

<style>
.modal-invite-user-title {
	width: 100%;
	text-align: center;
}
</style>