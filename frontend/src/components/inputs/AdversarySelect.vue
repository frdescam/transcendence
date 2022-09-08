<template>
	<q-select
		:label="capitalize($t('inputs.adversary'))"
		:hint="capitalize($t('inputs.adversaryHint'))"
		clearable
		emit-value
		map-options
		:options="adversaryOptions"
		@filter="getFriendList"
		v-bind="props"
		:modelValue="props.value"
	>
		<template v-slot:no-option>
			<q-item>
				<q-item-section class="text-italic text-grey">
					{{ capitalize($t('index.noFriends')) }}
				</q-item-section>
			</q-item>
		</template>
	</q-select>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { api } from 'src/boot/axios';
import { Capitalize } from 'src/boot/libs';
import { QSelect, useQuasar } from 'quasar';
import type { AxiosError } from 'axios';

interface selectOption
{
	label: string,
	value: string
}

export default defineComponent({
	name: 'AdversarySelect',
	props: ['value', 'v-on:input'],
	setup (props)
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const $q = useQuasar();
		const adversaryOptions = ref<selectOption[] | undefined>(undefined);

		function getFriendList (inputValue: string, doneFn: (callbackFn: () => void, afterFn?: ((ref: QSelect) => void) | undefined) => void): void
		{
			api.get('/friends/accepted')
				.then(({ data }) =>
				{
					doneFn(() =>
					{
						adversaryOptions.value = data.map(
							({ id, pseudo }: { id: number, pseudo: string }) =>
								({
									label: pseudo,
									value: id
								})
						);
					});
				})
				.catch((err: AxiosError) =>
				{
					$q.notify({
						position: 'top',
						type: 'negative',
						progress: true,
						timeout: 15000,
						message: err.message || (err + '')
					});
				});
		}

		return {
			capitalize,
			adversaryOptions,
			getFriendList,
			props
		};
	}
});
</script>
