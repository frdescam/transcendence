<script setup lang="ts">
import { ref, Ref } from 'vue';
import GameView from './game-view.vue';

defineProps<{ userId: string, party: string }>();

const pong = ref<Ref | null>(null);

</script>

<template>
  <q-card class="bg-blue-grey-1">

    <game-view ref="pong" :userId="userId" :party="party"></game-view>

    <q-card-actions>
      
      <q-btn-dropdown color="yellow-10" icon="tune" label="Graphics" auto-close>
        <q-list>
          <q-item clickable @click="pong.setQuality(0)" dense>
            <q-item-section>
              <q-item-label>Minimum</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="pong.setQuality(1)" dense>
            <q-item-section>
              <q-item-label>Bas</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="pong.setQuality(2)" dense>
            <q-item-section>
              <q-item-label>Moyen</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="pong.setQuality(3)" dense>
            <q-item-section>
              <q-item-label>Bon</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="pong.setQuality(4)" dense>
            <q-item-section>
              <q-item-label>Haut</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="pong.setQuality(5)" dense>
            <q-item-section>
              <q-item-label>Ultra</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn color="blue-7" icon="fullscreen" label="Fullscreen"/>

      <q-space />

      <q-btn
        color="green-7"
        :icon="pong && pong.state.paused ? 'play_arrow' : 'pause'"
        :label="pong && pong.state.paused ? 'Play' : 'Pause'"
        :disable="pong && !pong.state.ready"
        @click="pong.togglePause()"
      />

      <q-btn
        color="brown-7"
        icon-right="flag"
        label="Admit defeat"
        :disable="pong && !pong.state.ready"
      />

    </q-card-actions>

  </q-card>
</template>

<style scoped>
</style>
