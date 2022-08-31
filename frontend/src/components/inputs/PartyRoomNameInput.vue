<template>
	<q-input
    label="Room name"
    hint="The name of the party, which will be in the URL"
		v-bind="props"
    :modelValue="props.value"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PartyRoomNameInput',
	props: ['value', 'v-on:input'],
	setup (props)
	{
		return {
			props
		};
	}
});
</script>
