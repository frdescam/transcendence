<template>
	<q-page class="row items-center justify-evenly">
		<div>Hello World</div>
	</q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'IndexPage',
	setup ()
	{
		const $q = useQuasar();
		$q.notify('Message');
	}
});
</script>
