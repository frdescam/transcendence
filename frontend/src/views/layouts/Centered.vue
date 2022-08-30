<template>
	<None>
		<q-page class="row items-center justify-center" padding>
			<router-view />
		</q-page>
	</None>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import None from './None.vue';

export default defineComponent({
	name: 'CenteredLayout',
	components: {
		None
	}
});
</script>
