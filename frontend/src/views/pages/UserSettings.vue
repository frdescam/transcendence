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
		<!-- <q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">Password</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section>
				<passwordEditing></passwordEditing>
			</q-card-section>
		</q-card> -->

		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section>
				<div class="text-h6">{{ capitalize($t('setting.twoFactor.title')) }}</div>
			</q-card-section>
			<q-separator inset />
			<q-card-section class="column justify-center items-center">
				<div v-if="me.is2FActive">{{ capitalize($t('setting.twoFactor.subtitleOn')) }}</div>
				<div v-if="!me.is2FActive">{{ capitalize($t('setting.twoFactor.subtitleOff')) }}</div>
				<q-icon v-if="me.is2FActive && !TFAActivating" name="check_circle" color="green" size="200px"></q-icon>
				<q-icon v-if="!me.is2FActive && !TFAActivating" name="error" color="red" size="200px"></q-icon>
				<q-btn v-if="!TFAActivating && !me.is2FActive" @click="onActivate2FA">{{ capitalize($t('setting.twoFactor.activate')) }}</q-btn>
				<q-btn v-if="!TFAActivating && me.is2FActive" @click="onDeactivate2FA">{{ capitalize($t('setting.twoFactor.desactivate')) }}</q-btn>
				<q-img v-if="TFAActivating" src="http://127.0.0.1:8080/api/2FA/generate" :ratio="1" style="width: 200px"/>
				<q-form v-if="TFAActivating" class="column justify-evenly items-center full-height">
					<q-input @update:model-value="update" :disable="disableInput" :color="inputColor" :autofocus=true mask="######" label="Enter 2FA code :"></q-input>
				</q-form>
			</q-card-section>
		</q-card>

		<!-- <q-card bordered style='width: 300px;' class="my-card q-ma-md">
			<q-card-section>
				<div class="text-h6">Game options</div>
			</q-card-section>

			<q-separator inset />

			<q-card-section>
				<q-form method="post" @submit="GameOptionsSubmit">
					<q-select v-model="paddleSelected" :options="paddleOptions" label="Paddle Color" />
					<q-btn type="submit" class="q-mt-md" label='Update' />
				</q-form>
			</q-card-section>
		</q-card> -->

		<q-card bordered style='width: 300px;' class="q-ma-md">
			<q-card-section class="row justify-center">
				<q-form method="post" @submit="deleteAccount">
					<q-btn push :label="capitalize($t('setting.delete.title'))" color="red">
						<q-popup-proxy ref="popupDelete">
							<q-banner>
								<template v-slot:avatar>
									<q-icon name="warning" color="red" />
								</template>
								<div class="row no-wrap items-center">
									<span style="height: fit-content">{{ capitalize($t('setting.delete.subtitleOne')) }} {{ capitalize($t('setting.delete.subtitleTwo')) }}</span>
									<div>
										<q-btn flat icon="done" color="red" @click="deleteAccount" />
										<q-btn flat icon="close" color="secondary" @click="popupDelete.hide()" />
									</div>
								</div>
							</q-banner>
						</q-popup-proxy>
					</q-btn>
				</q-form>
			</q-card-section>
		</q-card>
	</q-list>
</template>

<script lang="ts">
import { inject, ref } from 'vue';
import { api } from 'boot/axios';
import { Capitalize } from 'src/boot/libs';
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import { QPopupProxy } from 'quasar';
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
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

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
			api.get('2FA/deactivate');
			me.value.is2FActive = false;
		}

		async function update (code: string)
		{
			console.log('me.value (in update) : ', me.value);
			if (code.length === 6)
			{
				disableInput.value = true;
				const res = await api.post('/2FA/turn-on', { code });
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

		api.get('/user/me').then((res) =>
		{
			me.value = res.data;
		});

		return {
			capitalize,

			// paddleSelected,
			TFAActivating,
			disableInput,
			inputColor,
			me,
			popupDelete,

			onActivate2FA,
			onDeactivate2FA,
			update,
			// GameOptionsSubmit ()
			// {
			// console.log(paddleSelected.value);
			// },
			deleteAccount ()
			{
				popupDelete.value?.hide();
				console.log('User deleted their account');
			},
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			]
		};
	}
});
</script>
