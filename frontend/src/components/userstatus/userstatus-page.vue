<script setup lang="ts">
import Card from './userstatus-card.vue';
import type { userId } from 'src/common/game/types';
defineProps<{ userId: userId }>();
</script>

<template>
  <h3>
		Querying userId: {{$props.userId}}
  </h3>
  <card :userId="$props.userId" username="USERNAME"/>
</template>

<style scoped>
</style>
