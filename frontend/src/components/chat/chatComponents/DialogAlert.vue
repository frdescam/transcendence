<template>
	<q-dialog
		ref="dialog"
		persistent
		color="primary"
		@hide="hide"
	>
		<q-card class="bg-teal text-white" style="width: 300px">
			<q-card-section class="q-pt-none text-h5 alert">
				{{
					$t(`chat.channel.menu.alert.${dialogType}.${dialogOn}`,
					{
						channel: String(channelName),
						date: printTimestamp()
					})
				}}
			</q-card-section>
			<q-card-actions
				align="right"
				class="bg-white text-teal"
			>
				<q-btn
					flat
					:label="$t('chat.channel.menu.alert.close')"
					v-close-popup
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { QDialog } from 'quasar';
import { Timestamp, TimestampFunction } from 'src/boot/libs';
import { defineComponent, inject, ref, watch } from 'vue';

export default defineComponent({
	props: {
		userId: Number,
		channelName: String,
		dialogShow: Boolean,
		dialogUser: Number,
		dialogType: String,
		dialogToggle: Boolean
	},
	emits: ['dialog-alert-accept'],
	setup (props, { emit })
	{
		const timestamp: TimestampFunction = inject('timestamp') as TimestampFunction;

		const dialog = ref<QDialog | null>(null);
		const dialogOn = ref<string>();

		const hide = () => emit('dialog-alert-accept');

		const printTimestamp = () =>
		{
			const messageDate: Timestamp = timestamp(new Date().toISOString());
			if (!messageDate)
				return '';
			return `${messageDate.day}/${messageDate.month}/${messageDate.year} - ${messageDate.hour}h${messageDate.minute}`;
		};

		watch(() => props.dialogShow, (after) =>
		{
			if (after === true && props.dialogUser === props.userId)
			{
				dialogOn.value = (props.dialogToggle) ? 'on' : 'off';
				dialog.value?.show();
			}
		});

		return {
			dialog,
			dialogOn,
			hide,
			printTimestamp
		};
	}
});
</script>

<style>
.alert {
	margin-top: 16px;
	text-align: center;
}
</style>
