<template>
	<q-dialog
		ref="dialog"
		persistent
		@before-hide="hide"
	>
		<q-card>
			<q-form @submit="deleteChannel">
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
						v-model="name"
						filled
						autofocus
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
						@click="confirm = false"
					/>
					<q-btn
						flat
						icon="done"
						color="secondary"
						type="submit"
						:label="$t('chat.channel.menu.delete.delete')"
						@click="confirm = true"
					/>
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { Socket } from 'socket.io-client';
import { QDialog } from 'quasar';
import { defineComponent, ref, inject, watch } from 'vue';

export default defineComponent({
	name: 'dialog_deletion',
	props: {
		dialogDeletionShow: Boolean,
		contextMenuSelectId: Number,
		contextMenuSelectName: String,
		userId: Number
	},
	emits: ['dialog-deletion-hide'],
	setup (props, { emit })
	{
		const socket: Socket = inject('socketChat') as Socket;

		const dialog = ref<QDialog | null>(null);
		const name = ref();
		const confirm = ref(false);

		const deleteChannel = () =>
		{
			if (confirm.value === false ||
				name.value !== props.contextMenuSelectName)
				return;
			dialog.value?.hide();
			socket.emit('channel::delete', {
				id: props.contextMenuSelectId,
				creator: props.userId,
				name: null,
				type: null,
				password: null
			});
		};

		const hide = () =>
		{
			confirm.value = false;
			name.value = '';
			emit('dialog-deletion-hide');
		};

		watch(() => props.dialogDeletionShow, (after, before) =>
		{
			if (before === false && after === true)
			{
				dialog.value?.show();
				name.value?.focus();
			}
		});

		return {
			dialog,
			name,
			confirm,
			deleteChannel,
			hide
		};
	}
});
</script>
