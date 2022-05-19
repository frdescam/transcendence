<template>
	<q-layout view="lHh Lpr lFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn
				flat
				dense
				round
				icon="menu"
				aria-label="Menu"
				@click="toggleLeftDrawer"
				/>
				<q-toolbar-title>
					Transcendance
				</q-toolbar-title>
			</q-toolbar>
		</q-header>

		<q-drawer
			v-model="leftDrawerOpen"
			show-if-above
			bordered
		>
			<q-list>
				<div>Hello</div>
				<router-link :to="{ path: '/chat' }">go to chat page</router-link><br/>
				<router-link :to="{ path: '/login' }">go to login page</router-link><br/>
			</q-list>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	name: 'MainLayout',

	setup ()
	{
		const leftDrawerOpen = ref(false);

		return {
			leftDrawerOpen,
			toggleLeftDrawer ()
			{
				leftDrawerOpen.value = !leftDrawerOpen.value;
			}
		};
	}
});
</script>
