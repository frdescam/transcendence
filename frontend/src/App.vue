<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import HelloWorld from './components/HelloWorld.vue'
import Header from './components/general/Header.vue'
</script>

<template>
  <Header accountName="username" />
  <h1>This is transcendance.</h1>
  <img class="responsive-img" style="height: 310px;" alt="Vue logo" src="./assets/expanding-brain.webp" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
