<script lang="ts">
export default {
	name: 'list-page'
};
</script>

<script setup lang="ts">
import List from 'src/components/games/list-view.vue';
</script>

<template>
	<q-page class="full-width row wrap justify-center">
		<div class="col-10 col-xl-8 col-lg-10 col-md-12 col-sm-12 col-xs-12">
			<List/>
		</div>
	</q-page>
	<!-- Go to the top FAB -->
</template>
