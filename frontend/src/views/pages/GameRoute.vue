<script setup lang="ts">
import { useRoute } from 'vue-router';
import GameInterface from '../../components/game/game-interface.vue';

defineProps<{ userId: string, party: string }>();

const route = useRoute();
const { party } = route.params;
const userId = "mockup";
</script>

<template>
	<q-page class="full-width row wrap justify-center">
		<div class="col-10 col-xl-8 col-lg-10 col-md-12 col-sm-12 col-xs-12">
			<game-interface :userId="userId" :party="party"/>
		</div>
	</q-page>
</template>

<style scoped>
</style>
