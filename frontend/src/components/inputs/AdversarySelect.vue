<template>
	<q-select
		label="Adversary"
		hint="If selected, an invitation would be sent"
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
					You don't have any friend to show
				</q-item-section>
			</q-item>
		</template>
	</q-select>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { api } from 'src/boot/axios';
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
							({ user: { id, pseudo } }: { user: { id: number, pseudo: string } }) =>
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
			adversaryOptions,
			getFriendList,
			props
		};
	}
});
</script>
