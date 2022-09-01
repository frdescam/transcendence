<template>
		<h1 class="text-white text-center">
			<q-spinner size="2em" />
			<br />
			Logging out...
		</h1>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import type { AxiosError } from 'axios';
import type { RefreshUserState } from 'src/boot/state';

export default defineComponent({
	name: 'LogoutPage',

	setup ()
	{
		const $q = useQuasar();
		const router = useRouter();
		const refreshUserState = inject('refreshUserState') as RefreshUserState;

		function fail (message: string, caption: string | undefined)
		{
			$q.notify({
				type: 'negative',
				message,
				caption
			});
			router.back();
		}

		onMounted(() =>
		{
			api.get('/logout')
				.then(({ data }) =>
				{
					if (data === 'logged out!')
					{
						$q.notify({
							type: 'positive',
							message: 'You were successfully unlogged'
						});
						router.push({
							name: 'login'
						});
					}
					else
					{
						fail(
							'Failed to log out',
							'Unexpected server answer'
						);
					}
					refreshUserState();
				})
				.catch((err: AxiosError) =>
				{
					fail(
						'Failed to log out',
						err.message || (err + '')
					);
				});
		});

		return {};
	}
});
</script>
