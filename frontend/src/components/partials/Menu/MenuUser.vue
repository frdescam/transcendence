<template>
	<q-spinner
		v-if="state.loading"
		size="2em"
		class="q-mx-md"
	/>

	<q-btn
		v-if="!state.loading && !state.loggedIn"
		flat
		:rounded="$q.screen.gt.xs"
		:round="$q.screen.lt.sm"
		:to="{ name: 'login' }"
	>
		<q-icon name="login" />
	</q-btn>

  <MenuUserDropdown
    v-if="!state.loading && state.loggedIn"
  />

</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import MenuUserDropdown from './MenuUserDropdown.vue';
import type { State } from 'src/boot/state';

export default defineComponent({
	name: 'PartialMenuUser',
	components: {
		MenuUserDropdown
	},
	setup ()
	{
		const state = inject('state') as State;

		return {
			state
		};
	}
});
</script>

<style scoped>
.inherit_color
{
	color: inherit;
}
</style>
