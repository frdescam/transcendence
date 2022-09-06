<template>
	<q-btn
		type="submit"
		color="primary"
		v-bind="props"
		:class="clsx('full-width', props.class)"
		:disable="props.loading"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import clsx from 'clsx';

export default defineComponent({
	name: 'SubmitButton',
	props: ['loading', 'class'],
	setup (props)
	{
		return {
			props,
			clsx
		};
	}
});
</script>
