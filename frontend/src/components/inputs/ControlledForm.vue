<template>
	<q-form
		v-bind="props"
		:class="clsx('q-gutter-md', props.class)"
		@submit="submit"
	>
		<slot></slot>
	</q-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useQuasar } from 'quasar';
import clsx from 'clsx';

export default defineComponent({
	name: 'ControlledForm',
	props: [
		'setLoading',
		'class',
		'action'
	],
	setup (props)
	{
		const $q = useQuasar();

		function submit (e: Event | SubmitEvent): void
		{
			const { setLoading, action } = props;
			if (typeof action === 'undefined' || !action)
				return;
			setLoading(true);
			action(e)
				.then(() =>
				{
					setLoading(false);
				})
				.catch((err: Error) =>
				{
					setLoading(false);
					$q.notify({
						position: 'top',
						type: 'negative',
						progress: true,
						timeout: 15000,
						message: err.message,
						caption: typeof err.cause !== 'undefined' ? (err.cause + '') : undefined
					});
				});
		}

		return {
			props,
			clsx,
			submit
		};
	}
});
</script>
