<template>
	<q-dialog
		ref="dialog"
		model="fixed"
		square
		@hide="reset"
	>
		<q-card>
			<q-card-section class="row items-center bg-primary text-white">
				<div class="text-h6" >{{ channelName }}</div>
				<q-space />
				<q-btn icon="close" flat round dense v-close-popup />
			</q-card-section>
			<q-separator />
			<q-card-section class="dialog">
				<template v-if="error">
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
					@submit="verify"
				>
					<q-input
						type="text"
						autofocus
						filled
						v-model="password"
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
import { QDialog } from 'quasar';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
	name: 'dialog_password',
	props: {
		dialogPasswordShow: Boolean,
		channelName: String,
		channelPassword: String
	},
	emits: ['dialog-password-hide', 'dialog-password-ok'],
	setup (props, { emit })
	{
		const dialog = ref<QDialog | null>(null);
		const error = ref<boolean>();
		const password = ref();
		const isSet = ref(false);

		const reset = () =>
		{
			password.value = null;
			error.value = false;
			emit('dialog-password-hide', isSet.value);
		};

		const verify = () =>
		{
			if (password.value !== props.channelPassword)
				error.value = true;
			else
			{
				isSet.value = true;
				emit('dialog-password-ok', isSet.value);
				dialog.value?.hide();
				isSet.value = false;
			}
		};

		watch(() => props.dialogPasswordShow, (after, before) =>
		{
			if (before === false && after === true)
			{
				dialog.value?.show();
				password.value?.focus();
			}
		});

		return {
			dialog,
			error,
			password,
			isSet,
			reset,
			verify
		};
	}
});
</script>
