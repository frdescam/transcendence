<template>
	<q-dialog
		ref="dialog"
		model="square"
		square
	>
		<q-card style="width: 450px; max-width: 60vw;">
			<q-card-section class="row justify-end q-pb-none" style="position: fixed; width: inherit; z-index: 2">
        <q-btn icon="close" flat round dense v-close-popup @click="close" />
      </q-card-section>
			<q-item>
				<q-item-section avatar>
          <q-avatar style="width: 3em; height: 3em">
            <img :src="user.avatar" v-on:error="imageError" />
          </q-avatar>
				</q-item-section>
				<q-item-section class="column">
          <span class="text-h6">{{ user.pseudo }}</span>
          <div class="row">
            <q-badge :label="$t('chat.user.xp').toUpperCase()" />
            <span>{{ user.xp }}</span>
          </div>
				</q-item-section>
			</q-item>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { QDialog } from 'quasar';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
	name: 'dialog_profile',
	props: [
		'user',
		'dialogProfilShow'
	],
	emits: ['dialog_profil_close'],
	setup: (props, { emit }) =>
	{
		const dialog = ref<QDialog | null>(null);

		const imageError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		const close = () =>
		{
			dialog.value?.hide();
			emit('dialog_profil_close');
		};

		watch(() => props.dialogProfilShow, (after, before) =>
		{
			if (before === false && after === true)
				dialog.value?.show();
		});

		return {
			dialog,

			imageError,
			close
		};
	}
});
</script>
