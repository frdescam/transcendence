<template>
	<q-card class="overflow-hidden q-pa-md">
		<ControlledForm
			:setLoading="setLoading"
			:action="createGame"
		>
			<PartyRoomNameInput
				filled
				v-model="room"
			/>

			<MapSelect
				filled
				v-model="map"
			/>

			<AdversarySelect
				filled
				v-model="adversary"
			/>

			<div>
				<SubmitButton
					label="Create my party"
					:loading="loading"
				/>
			</div>
		</ControlledForm>
	</q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import ControlledForm from 'src/components/inputs/ControlledForm.vue';
import SubmitButton from 'src/components/inputs/SubmitButton.vue';
import PartyRoomNameInput from 'src/components/inputs/PartyRoomNameInput.vue';
import MapSelect from 'src/components/inputs/MapSelect.vue';
import AdversarySelect from 'src/components/inputs/AdversarySelect.vue';
import type { AxiosError } from 'axios';

const room = ref<string | null>(null);
const map = ref<string | null>(null);
const adversary = ref<string | null>(null);

export default defineComponent({
	name: 'GameCreation',
	components: {
		ControlledForm,
		SubmitButton,
		PartyRoomNameInput,
		MapSelect,
		AdversarySelect
	},
	setup ()
	{
		const router = useRouter();
		const loading = ref<boolean>(false);

		function setLoading (state: boolean)
		{
			loading.value = state;
		}

		async function createGame ()
		{
			return api.post('/party', {
				room: room.value ?? undefined,
				map: map.value ?? undefined,
				adversary: adversary.value ?? undefined
			})
				.then(({ data }) =>
				{
					const partyRoom = data as string;

					router.push({
						name: 'party',
						params: {
							party: partyRoom
						}
					});
				})
				.catch((err: AxiosError) =>
				{
					if (err.response?.data.message)
					{
						throw new Error(
							err.response?.data.message,
							{
								cause: err
							}
						);
					}
					else
						throw err;
				});
		}

		return {
			loading,
			setLoading,
			room,
			map,
			adversary,
			createGame
		};
	}
});
</script>
