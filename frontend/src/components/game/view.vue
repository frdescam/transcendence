<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, readonly } from 'vue'

interface gameState {
  loaded: boolean,
  ready: boolean,
  paused: boolean,
  graphics: 0|1|2|3|4|5
}

defineProps<{ userId: string, party: string }>()


const state = reactive<gameState>({ loaded: false, ready: false, paused: true, graphics: 1 });

onMounted(()=>{
  
})

onBeforeUnmount(()=>{

})

function togglePause()
{
  M.toast({html: 'Game paused'});
  state.paused = !state.paused;
}

defineExpose({
  togglePause,
  state: readonly(state)
})
</script>

<template>
  <div class="root">

    <canvas class="game-container" id="game-threejs-canvas"></canvas>

    <div class="valign-wrapper game-container" v-if="!state.loaded">
      <div class="progress brown lighten-4">
        <div class="indeterminate green"></div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.root
{
  position: relative;
  padding-bottom: 56.25%;
}
.game-container
{
  position: absolute;
  height: 100%;
  width: 100%;
}
.progress
{
  margin: 5em;
}
</style>
