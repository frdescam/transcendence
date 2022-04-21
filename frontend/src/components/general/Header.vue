<script setup lang="ts">

defineProps<{ accountName: string }>()

</script>

<template>
	<nav class="nav-wrapper">
		<a href="#" class="brand-logo">Pong</a>
		<ul class="right hide-on-med-and-down">
			<li><a href="#">Scores</a></li>
			<li><a href="#">Chat</a></li>
			<li><a href="#">{{ accountName }}</a></li>
		</ul>
	</nav>
</template>

<style>
nav {
	top: 0;
}
</style>