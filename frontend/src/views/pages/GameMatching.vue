<template>
	<q-card class="overflow-hidden q-pa-md">
		<ControlledForm
			:setLoading="setLoading"
			:action="queryMatch"
		>
			<MapSelect
				filled
				v-model="map"
			/>

			<AdversarySelect
				filled
				hint="If selected, you will be queued to play with that person particularly"
				v-model="adversary"
			/>

			<div>
				<SubmitButton
					label="Place a query"
					:loading="loading"
				/>
			</div>
		</ControlledForm>
	</q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import ControlledForm from 'src/components/inputs/ControlledForm.vue';
import SubmitButton from 'src/components/inputs/SubmitButton.vue';
import MapSelect from 'src/components/inputs/MapSelect.vue';
import AdversarySelect from 'src/components/inputs/AdversarySelect.vue';

const map = ref<string | null>(null);
const adversary = ref<string | null>(null);

export default defineComponent({
	name: 'GameMatching',
	components: {
		ControlledForm,
		SubmitButton,
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

		async function queryMatch ()
		{
			router.push({
				name: 'matching',
				query: {
					map: map.value ?? undefined,
					adversary: adversary.value ?? undefined
				}
			});
		}

		return {
			loading,
			map,
			adversary,
			setLoading,
			queryMatch
		};
	}
});
</script>
