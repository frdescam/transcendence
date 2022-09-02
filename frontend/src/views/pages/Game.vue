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
  <game-interface :party="party as string"/>
</template>

<style scoped>
</style>
