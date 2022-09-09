<template>
	<q-input
		:label="capitalize($t('inputs.room'))"
		:hint="capitalize($t('inputs.roomHint'))"
		v-bind="props"
    :modelValue="props.value"
	/>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Capitalize } from 'src/boot/libs';

export default defineComponent({
	name: 'PartyRoomNameInput',
	props: ['value', 'v-on:input'],
	setup (props)
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		return {
			capitalize,
			props
		};
	}
});
</script>
