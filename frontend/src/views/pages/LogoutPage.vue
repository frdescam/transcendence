<template>
		<h1 class="text-white text-center">
			<q-spinner size="2em" />
			<br />
			{{ capitalize($t('login.logout')) }}
		</h1>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { AxiosError } from 'axios';
import type { RefreshUserState } from 'src/boot/state';
import { Capitalize } from 'src/boot/libs';

export default defineComponent({
	name: 'LogoutPage',

	setup ()
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const { t } = useI18n();
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
							message: capitalize(t('login.logoutPage.success'))
						});
					}
					else
					{
						fail(
							capitalize(t('login.logoutPage.failOne')),
							capitalize(t('login.logoutPage.failTwo'))
						);
					}
					refreshUserState();
					router.push({
						name: 'logging'
					});
				})
				.catch((err: AxiosError) =>
				{
					fail(
						capitalize(t('login.logoutPage.failOne')),
						err.message || (err + '')
					);
				});
		});

		return {
			capitalize
		};
	}
});
</script>
