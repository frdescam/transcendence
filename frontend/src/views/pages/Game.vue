<script lang="ts">
export default {
	name: 'game-page'
};
</script>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import GameInterface from '../../components/game/game-interface.vue';

const route = useRoute();
const { party } = route.params;
</script>

<template>
	<q-page class="full-width row wrap justify-center">
		<div class="col-10 col-xl-8 col-lg-10 col-md-12 col-sm-12 col-xs-12">
			<game-interface :party="party as string"/>
		</div>
	</q-page>
</template>

<style scoped>
</style>
