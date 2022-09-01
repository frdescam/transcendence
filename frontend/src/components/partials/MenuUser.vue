<template>
	<q-spinner
		v-if="loading"
		size="2em"
		class="q-mx-md"
	/>

	<q-btn
		v-if="!loading && !loggedIn"
		flat
		:rounded="$q.screen.gt.xs"
		:round="$q.screen.lt.sm"
		:to="{ name: 'login' }"
	>
		<q-icon name="login" />
	</q-btn>

	<q-btn-dropdown
		v-if="!loading && loggedIn"
		no-caps
		no-wrap
		stretch
		flat
		:dense="$q.screen.lt.md"
		:label="$q.screen.gt.md ? myself.username : undefined"
		:icon="myself.avatar ? `img:${myself.avatar}` : undefined"
	>
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
import { defineComponent, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

interface myself
{
	id?: number,
	username?: string,
	avatar?: string
}

export default defineComponent({
	name: 'PartialMenuUser',
	setup ()
	{
		const $q = useQuasar();

		const loading = ref<boolean>(true);
		const loggedIn = ref<boolean>(false);
		const myself = ref<myself>({});

		onMounted(() =>
		{
			loading.value = true;
			api.get('/logged')
				.then(({ data: { id, pseudo, avatar } }) =>
				{
					myself.value = {
						id,
						username: pseudo,
						avatar
					};
					loggedIn.value = true;
				})
				.catch((err: AxiosError) =>
				{
					loggedIn.value = false;
					myself.value = {};
					if (typeof err.response === 'undefined' || err.response.status !== 401)
					{
						$q.notify({
							type: 'negative',
							message: 'Failed to check login status',
							caption: err.message || (err + '')
						});
					}
				})
				.finally(() =>
				{
					loading.value = false;
				});
		});

		return {
			loading,
			loggedIn,
			myself
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
