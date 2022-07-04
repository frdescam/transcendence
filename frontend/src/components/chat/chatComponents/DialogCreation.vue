<template>
	<q-dialog
		ref="dialog"
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
				<template v-if="error > 0">
					<q-banner
						inline-actions
						class="text-white bg-red"
					>
						<div v-if="error === 1">{{ $t('chat.channel.modal.listErrors.name') }}</div>
						<div v-if="error === 2">{{ $t('chat.channel.modal.listErrors.type') }}</div>
						<div v-if="error === 3">{{ $t('chat.channel.modal.listErrors.password') }}</div>
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
						v-model="name"
						:label="$t('chat.channel.modal.name')"
						:rules="[(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')]"
					/>
					<q-space />
					<q-option-group
						v-model="type"
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
					<div v-if="type === 'protected'">
						<q-separator inset style="margin-bottom: 1em;"/>
						<q-input
							v-model="passwordOne"
							filled
							:type="switchPassOne ? 'password' : 'text'"
							:label="$t('chat.channel.modal.password')"
							:rules="[
								(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')
							]"
						>
							<template v-slot:append>
								<q-icon
									:name="switchPassOne ? 'visibility_off' : 'visibility'"
									class="cursor-pointer"
									@click="switchPassOne = !switchPassOne"
								/>
							</template>
						</q-input>
						<span style="display: block; height:1em"></span>
						<q-input
							v-model="passwordTwo"
							filled
							:type="switchPassTwo ? 'password' : 'text'"
							:label="$t('chat.channel.modal.repeat')"
							:rules="[
								(val: string) => val && val.length > 0 || $t('chat.channel.modal.error')
							]"
						>
							<template v-slot:append>
								<q-icon
									:name="switchPassTwo ? 'visibility_off' : 'visibility'"
									class="cursor-pointer"
									@click="switchPassTwo = !switchPassTwo"
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
</template>

<script lang="ts">
import { Socket } from 'socket.io-client';
import { QDialog } from 'quasar';
import sanitizeHtml from 'sanitize-html';
import { defineComponent, ref, inject, watch } from 'vue';

export default defineComponent({
	name: 'dialog_creation',
	props: {
		dialogCreationShow: Boolean
	},
	emits: ['dialog-creation-hide'],
	setup (props, { emit })
	{
		const socket: Socket = inject('socket') as Socket;

		const dialog = ref<QDialog | null>(null);
		const error = ref(0);
		const name = ref(null);
		const type = ref(null);
		const passwordOne = ref(null);
		const passwordTwo = ref(null);
		const switchPassOne = ref(true);
		const switchPassTwo = ref(true);

		const resetDialog = () =>
		{
			dialog.value?.hide();
			name.value = null;
			type.value = null;
			passwordOne.value = null;
			passwordTwo.value = null;
			error.value = 0;
			emit('dialog-creation-hide');
		};

		const createChannel = () =>
		{
			if (!name.value)
			{
				error.value = 1;
				return;
			}
			if (!type.value)
			{
				error.value = 2;
				return;
			}
			if (type.value === 'protected')
			{
				if (!passwordOne.value || !passwordTwo.value ||
					passwordOne.value !== passwordTwo.value
				)
				{
					error.value = 3;
					return;
				}
			}
			socket.emit('chat::channel::add', {
				id: null,
				creator: Number(localStorage.getItem('chat::user::id')),
				name: sanitizeHtml(name.value),
				type: sanitizeHtml(type.value),
				password: passwordOne.value
			});
			dialog.value?.hide();
			resetDialog();
		};

		watch(() => props.dialogCreationShow, (after, before) =>
		{
			if (before === false && after === true)
				dialog.value?.show();
		});

		return {
			dialog,
			error,
			name,
			type,
			passwordOne,
			passwordTwo,
			switchPassOne,
			switchPassTwo,
			resetDialog,
			createChannel
		};
	}
});
</script>
