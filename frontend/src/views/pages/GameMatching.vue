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
				:hint="capitalize($t('inputs.matchHint'))"
				v-model="adversary"
			/>

			<div>
				<SubmitButton
					:label="capitalize($t('inputs.query'))"
					:loading="loading"
				/>
			</div>
		</ControlledForm>
	</q-card>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Capitalize } from 'src/boot/libs';
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
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
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
			capitalize,
			loading,
			map,
			adversary,
			setLoading,
			queryMatch
		};
	}
});
</script>
