<template>
	<q-dialog
		ref="dialog"
		model="fixed"
		square
		no-esc-dismiss
		no-backdrop-dismiss
	>
		<q-card>
				<q-card-section class="column items-center">
					<u class="text-h5">{{ $props.channelName }}</u>
					<span v-if="!$props.channelCreator" class="q-ml-sm">{{ $t('chat.quit.info') }}</span>
					<span v-else class="q-ml-sm">{{ $t('chat.quit.creator') }}</span>
				</q-card-section>
				<q-card-actions class="row justify-center">
					<q-btn flat icon="close" color="red" @click="validation(false)" />
					<q-btn flat icon="check" color="secondary" @click="validation(true)" />
				</q-card-actions>
			</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { QDialog } from 'quasar';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
	name: 'dialog_quit',
	props: {
		dialogQuitShow: Boolean,
		channelName: String,
		channelCreator: Boolean,
		channelId: Number
	},
	emits: ['dialog-quit-hide', 'dialog-quit-ok'],
	setup (props, { emit })
	{
		const dialog = ref<QDialog | null>(null);

		const validation = (val: boolean) =>
		{
			dialog.value?.hide();
			emit('dialog-quit-ok', val);
		};

		watch(() => props.dialogQuitShow, (after, before) =>
		{
			if (before === false && after === true)
				dialog.value?.show();
		});

		return {
			dialog,
			validation
		};
	}
});
</script>
