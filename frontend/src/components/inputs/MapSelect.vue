<template>
	<q-select
		label="Map"
		hint="The map affect ball's speed and allowed controls"
    clearable
    emit-value
    map-options
		:options="mapOptions"
		v-bind="props"
    :modelValue="props.value"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import maps from 'src/common/game/maps';

const mapOptions = Object.keys(maps).map(
	(mapKey) => ({
		label: maps[mapKey].name,
		value: mapKey
	})
);

export default defineComponent({
	name: 'MapSelect',
	props: ['value', 'v-on:input'],
	setup (props)
	{
		return {
			mapOptions,
			props
		};
	}
});
</script>
