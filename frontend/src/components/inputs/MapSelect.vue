<template>
	<q-select
		:label="capitalize($t('inputs.map'))"
		:hint="capitalize($t('inputs.mapHint'))"
    clearable
    emit-value
    map-options
		:options="mapOptions"
		v-bind="props"
    :modelValue="props.value"
	/>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Capitalize } from 'src/boot/libs';
import maps from 'src/common/game/maps';

export default defineComponent({
	name: 'MapSelect',
	props: ['value', 'v-on:input'],
	setup (props)
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const mapOptions = Object.keys(maps).map(
			(mapKey) => ({
				label: maps[mapKey].name,
				value: mapKey
			})
		);
		return {
			capitalize,
			mapOptions,
			props
		};
	}
});
</script>
