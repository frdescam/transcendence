<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, readonly, ref, Ref } from 'vue';
import Scene, { mapConfig, options } from './canvas/scene';
import config from './maps/forest/config';
import profil from "./ressources/demo_avatar.jpeg?url";

interface gameState {
  loaded: boolean,
  ready: boolean,
  paused: boolean,
  graphics: 0|1|2|3|4|5
}

defineProps<{ userId: string, party: string }>()


const state = reactive<gameState>({ loaded: false, ready: false, paused: true, graphics: 0 });

var scene: null | Scene = null;
const canvas = ref<Ref | null>(null);

function animate()
{
  (scene as Scene).render();
}

function resize()
{
  (scene as Scene).setSize(canvas.value.offsetWidth, canvas.value.offsetHeight);
}

onMounted(()=>{
  	scene = new Scene(
      config as mapConfig,
      {
        targetElem: canvas.value,
        qualityLevel: state.graphics,
        width: canvas.value.offsetWidth,
        height: canvas.value.offsetHeight,
        onReady: () => {
          state.loaded = true;
          (scene as Scene).setAnimationLoop(animate);
        },
      } as options,
      0
    );
    scene.setState({
      paused: true,
      ballY: 0.5,
      ballSpeedX: 1,
      text: "Awaiting players...",
      textSize: 0.5,
      textColor: 0xff0000,
      avatars: [profil, null]
    }, 0);

    window.addEventListener('resize', resize);
    // (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
})

onBeforeUnmount(()=>{
  (scene as Scene).setAnimationLoop(null);
  window.removeEventListener('resize', resize);
  
  scene?.dispose();
  scene = null;
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

    <canvas class="game-container" ref="canvas"></canvas>

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
  height: 100% !important;
  width: 100% !important;
}
.progress
{
  margin: 5em;
}
</style>
