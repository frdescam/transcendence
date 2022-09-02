<template>
		<h1 class="text-white text-center">
			<q-spinner size="2em" />
			<br />
			Checking token...
		</h1>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { RefreshUserState, State } from 'src/boot/state';

export default defineComponent({
	name: 'LoggingPage',

	setup ()
	{
		const router = useRouter();
		const route = useRoute();
		const refreshUserState = inject('refreshUserState') as RefreshUserState;
		const state = inject('state') as State;

		onMounted(() =>
		{
			if (!state.loading)
				refreshUserState();
			watch(
				state,
				function (newState)
				{
					if (!newState.loading)
					{
						if (newState.loggedIn)
						{
							if (typeof route.query.next !== 'undefined' && route.query.next && route.query.next.length > 0)
								router.push({ path: route.query.next.toString() });
							else
								router.push({ name: 'home' });
						}
						else
							router.push({ name: 'login' });
					}
				},
				{
					flush: 'post'
				}
			);
		});

		return {};
	}
});
</script>
