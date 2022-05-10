<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'
import View from './view.vue';

defineProps<{ userId: string, party: string }>();

const pong = ref<Ref | null>(null);

onMounted(()=>{
})
</script>

<template>
  <div class="card hoverable blue-grey lighten-5">

    <div class="card-media">
      <View ref="pong" :userId="userId" :party="party"></View>
    </div>
    
    <div class="card-action game-actions">

      <button class="btn waves-effect waves-light yellow darken-4">
        Grapgics
        <i class="material-icons left">tune</i>
      </button>

      <button class="btn waves-effect waves-light blue darken-1" @click="">
        Fullscreen
        <i class="material-icons left">fullscreen</i>
      </button>

      <div class="right-action">

        <button
            class="btn waves-effect waves-light green darken-1"
            :class="pong && !pong.state.ready && 'disabled'"
            @click="pong.togglePause()"
          >
          <template v-if="pong && pong.state.paused">
            Pause
            <i class="material-icons left">pause</i>
          </template>
          <template v-else>
            Play
            <i class="material-icons left">play_arrow</i>
          </template>
        </button>

        <button
            class="btn waves-effect waves-light brown darken-1"
            :class="pong && !pong.state.ready && 'disabled'"
            @click=""
          >
          Admit defeat
          <i class="material-icons right">flag</i>
        </button>

      </div>

    </div>

  </div>
</template>

<style scoped>
.right-action
{
  float: right;
}
.game-actions > *:not(.right-action), .game-actions > .right-action > *
{
  margin: 0 0.5em;
}
.game-actions > *:not(.right-action):first-child
{
  margin-left: 0;
}
.game-actions > .right-action > *:last-child
{
  margin-right: 0;
}
</style>
