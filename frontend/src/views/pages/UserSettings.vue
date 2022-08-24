<template>
	<q-page class="row items-start justify-evenly">
		<q-list class="row q-ma-md justify-evenly shadow-2 rounded-borders">
			<q-toolbar>
				<q-toolbar-title class="q-ml-lg q-mt-md">Settings:</q-toolbar-title>
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
					<div class="text-h6">Two factor authentication</div>
				</q-card-section>
				<q-separator inset />
				<q-card-section class="column justify-center items-center">
                    <q-btn v-if="!TFAActivating" @click="on2FAClick">Activate</q-btn>
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
				<q-card-section>
					<div class="text-h6">Danger zone!</div>
				</q-card-section>
				<q-separator inset />
				<q-card-section>
					<q-form method="post" @submit="deleteAccount">
						<q-btn push label="Delete your account">
							<q-popup-proxy>
								<q-banner>
									<template v-slot:avatar>
										<q-icon name="warning" color="red" />
									</template>
									Are you sure? You will lose all progress.
									<q-btn @click="deleteAccount" color="red" class="q-ma-xs" label='Yes' />
								</q-banner>
							</q-popup-proxy>
						</q-btn>
					</q-form>
				</q-card-section>
			</q-card>
		</q-list>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
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
		const TFAActivating = ref(false);
		const paddleSelected = ref('Normal');
		const disableInput = ref(false);
		const inputColor = ref('blue');
		const me = ref({});

		function on2FAClick ()
		{
			TFAActivating.value = true;
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
					console.log('ok');
			}
		}

		api.get('/user/me').then((res) =>
		{
			me.value = res.data;
			console.log('me.value (in get in setup) : ', me.value);
		});

		return {
			paddleSelected,
			TFAActivating,
			disableInput,
			inputColor,
			me,

			on2FAClick,
			update,
			GameOptionsSubmit ()
			{
				console.log(paddleSelected.value);
			},
			deleteAccount ()
			{
				console.log('User deleted their account');
			},
			paddleOptions: [
				'Normal', 'Fire', 'Air', 'Water', 'Earth'
			]
		};
	}
});
</script>
