<script setup lang="ts">
import Game from './game/index.vue';

defineProps<{ userId: string, party: string }>()
</script>

<template>
  <div class="container">
    <h2>Party #{{party}}</h2>
    <Game :userId="userId" :party="party"/>
  </div>
</template>

<style scoped>
</style>
