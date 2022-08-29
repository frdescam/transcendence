<template>
	<q-layout view="hHh lpR fFf" class="background" :style="{'background-image': `url(${$route.meta.background})`, 'background-color': $route.meta.backgroundColor}">
		<q-header elevated>
			<Menu />
		</q-header>

		<q-page-container>
			<slot>
				<router-view />
			</slot>
		</q-page-container>
	</q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Menu from 'src/components/partials/Menu.vue';

export default defineComponent({
	name: 'NoneLayout',
	components: {
		Menu
	}
});
</script>

<style scoped>
.background
{
	background-position: center center;
	background-size: cover;
	background-attachment: local;
}
</style>
