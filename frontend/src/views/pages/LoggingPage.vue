<template>
		<h1 class="text-white text-center">
			<q-spinner size="2em" />
			<br />
			Checking token...
		</h1>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, inject, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { WatchStopHandle } from 'vue';
import type { RefreshUserState, State } from 'src/boot/state';

export default defineComponent({
	name: 'LoggingPage',

	setup ()
	{
		const router = useRouter();
		const route = useRoute();
		const refreshUserState = inject('refreshUserState') as RefreshUserState;
		const state = inject('state') as State;

		var unwatch: null | WatchStopHandle = null;

		onMounted(() =>
		{
			if (!state.loading)
				refreshUserState();
			unwatch = watch(
				state,
				function (newState)
				{
					if (!newState.loading)
					{
						if (newState.loggedIn)
						{
							if (typeof route.query.next !== 'undefined' && route.query.next && route.query.next.length > 0)
								router.replace({ path: route.query.next.toString() });
							else
								router.replace({ name: 'home' });
						}
						else
							router.replace({ name: 'login' });
					}
				},
				{
					flush: 'post'
				}
			);
		});

		onUnmounted(() =>
		{
			if (unwatch)
				unwatch();
		});

		return {};
	}
});
</script>
