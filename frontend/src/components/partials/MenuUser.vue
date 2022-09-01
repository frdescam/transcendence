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

	<q-btn-dropdown
		v-if="!state.loading && state.loggedIn"
		no-caps
		no-wrap
		stretch
		flat
		:dense="$q.screen.lt.md"
	>
		<template v-slot:label>
			<q-avatar :class="clsx($q.screen.gt.md && 'on-left')">
				<img :src="`${state.myself.avatar}?${state.userStateUpdatedAt}`">
			</q-avatar>
			<span class="block" v-if="$q.screen.gt.md">
				{{state.myself.username}}
			</span>
		</template>
		<q-list>

			<q-item clickable :to="{name: 'settings'}">
				<q-item-section side class="inherit_color">
					<q-icon name="settings" />
				</q-item-section>
				<q-item-section no-wrap>
					<q-item-label>Account settings</q-item-label>
				</q-item-section>
			</q-item>

			<q-item clickable disable>
				<q-item-section side class="inherit_color">
					<q-icon name="sports_esports" />
				</q-item-section>
				<q-item-section no-wrap>
					<q-item-label>Retake the game</q-item-label>
				</q-item-section>
			</q-item>

			<q-separator inset />

			<q-item clickable :to="{name: 'logout'}">
				<q-item-section side class="inherit_color">
					<q-icon name="logout" />
				</q-item-section>
				<q-item-section no-wrap>
					<q-item-label>Disconnect</q-item-label>
				</q-item-section>
			</q-item>

		</q-list>
	</q-btn-dropdown>

</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import clsx from 'clsx';
import type { State } from 'src/boot/state';

export default defineComponent({
	name: 'PartialMenuUser',
	setup ()
	{
		const state = inject('state') as State;

		return {
			clsx,
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
