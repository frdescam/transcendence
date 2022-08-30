<script setup lang="ts">
import type { controlsMode } from 'src/common/game/types';
import type { interfaceState } from './game-view.vue';

type actionCallback = (control: controlsMode) => void;

defineProps<{
  state: interfaceState | null,
  action: actionCallback,
  controlName: controlsMode,
  icon: string, label: string
}>();
</script>

<template>
  <q-item
    clickable
    dense
    active-class="bg-blue-1 text-blue-8"
    :disable="!state?.available_controls[controlName]"
    :active="state?.controls[controlName]"
    @click="action(controlName)"
  >
    <q-item-section side class="inherit_color">
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{label}}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<style scoped>
.inherit_color
{
	color: inherit;
}
</style>
