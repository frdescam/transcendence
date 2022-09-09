<template>
	<q-list class="row justify-evenly shadow-2 rounded-borders bg-white">
		<q-toolbar>
			<q-toolbar-title class="q-ml-lg q-mt-md">{{ capitalize($t('setting.title')) }}</q-toolbar-title>
		</q-toolbar>
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<pseudoEditing :pseudo='me.pseudo' v-on:update:pseudo="me.pseudo = $event"></pseudoEditing>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<pictureEditing :avatar="me.avatar"></pictureEditing>
			</q-card-section>
		</q-card>
		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">{{ capitalize($t('setting.twoFactor.title')) }}</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section class="column justify-between items-center" style="height: 400px">
				<div v-if="me.is2FActive">{{ capitalize($t('setting.twoFactor.subtitleOn')) }}</div>
				<div v-if="!me.is2FActive">{{ capitalize($t('setting.twoFactor.subtitleOff')) }}</div>
				<q-icon v-if="me.is2FActive && !TFAActivating" name="check_circle" color="green" size="200px"></q-icon>
				<q-icon v-if="!me.is2FActive && !TFAActivating" name="error" color="red" size="200px"></q-icon>
				<q-btn v-if="!TFAActivating && !me.is2FActive" @click="onActivate2FA">{{ capitalize($t('setting.twoFactor.activate')) }}</q-btn>
				<q-btn v-if="!TFAActivating && me.is2FActive" @click="onDeactivate2FA">{{ capitalize($t('setting.twoFactor.desactivate')) }}</q-btn>
				<q-img v-if="TFAActivating" :src="`${env.VITE_API_HOST}/2FA/generate?time=${new Date().getTime()}`" :ratio="1" style="width: 200px"/>
				<q-form v-if="TFAActivating" class="column justify-evenly items-center q-pb-lg">
					<q-input @update:model-value="update" :disable="disableInput" :color="inputColor" :autofocus=true mask="######" :label="capitalize($t('twofa.label'))"></q-input>
				</q-form>
			</q-card-section>
		</q-card>
	</q-list>
</template>

<script lang="ts">
import { inject, ref } from 'vue';
import { AxiosInstance } from 'axios';
import { Capitalize } from 'src/boot/libs';
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import { QPopupProxy } from 'quasar';
import type { catchAxiosType } from 'src/boot/axios';
// import passwordEditing from 'src/components/userSettings/passwordEditing.vue';

export default ({
	name: 'IndexPage',
	components: {
		pseudoEditing,
		pictureEditing//,
		// passwordEditing
	},
	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const catchAxios = inject('catchAxios') as catchAxiosType;
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const env = ref(import.meta.env);

		const TFAActivating = ref(false);
		// const paddleSelected = ref('Normal');
		const disableInput = ref(false);
		const inputColor = ref('blue');
		const popupDelete = ref<QPopupProxy | null>(null);
		const me = ref({});

		function onActivate2FA ()
		{
			TFAActivating.value = true;
			disableInput.value = false;
			inputColor.value = 'blue';
		}

		function onDeactivate2FA ()
		{
			catchAxios(api.get('2FA/deactivate'));
			me.value.is2FActive = false;
		}

		async function update (code: string)
		{
			if (code.length === 6)
			{
				disableInput.value = true;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const res: any = await catchAxios(api.post('/2FA/turn-on', { code }));
				if (res.data.error)
				{
					disableInput.value = false;
					inputColor.value = 'red';
				}
				else
				{
					me.value.is2FActive = true;
					TFAActivating.value = false;
				}
			}
		}

		catchAxios(
			api.get('/user/me').then((res) =>
			{
				me.value = res.data;
			})
		);

		return {
			capitalize,
			env,

			TFAActivating,
			disableInput,
			inputColor,
			me,
			popupDelete,

			onActivate2FA,
			onDeactivate2FA,
			update,
			deleteAccount ()
			{
				popupDelete.value?.hide();
			},
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			]
		};
	}
});
</script>
