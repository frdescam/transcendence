<template>
	<None>
		<q-page class="full-width row wrap justify-center" padding>
			<div class="col-12 col-xl-7 col-lg-9 col-md-12 col-sm-12 col-xs-12">
				<router-view />
			</div>
		</q-page>
	</None>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import None from './None.vue';

export default defineComponent({
	name: 'StandardLayout',
	components: {
		None
	}
});
</script>
