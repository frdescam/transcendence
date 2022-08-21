<template>
	<q-layout view="hHh lpR fFf">
		<q-header elevated>
			<q-toolbar id="header-contents" class="row justify-between">
				<q-btn flat no-caps no-wrap no-ripple :to="{ path: '/' }">
					<q-toolbar-title>
						<q-icon class="q-mr-sm"
							name="img:https://www.pinclipart.com/picdir/big/535-5355934_ping-pong-table-tennis-icon-png-clipart.png" />
						Transcendance
					</q-toolbar-title>
				</q-btn>
				<div class="row q-gutter-md no-wrap mobile-hide">
					<q-btn flat rounded :to="{ path: '/play' }" label="Play" />
					<q-btn flat rounded :to="{ path: '/chat' }" label="Chat" />
					<q-btn flat rounded :to="{ path: '/leaderboard' }" label="Leaderboard" />
				</div>
				<div class="row q-ml-md no-wrap">
					<q-btn flat rounded :to="{ path: '/settings' }">
						<q-icon name="settings" />
					</q-btn>
					<q-btn flat rounded :to="{ path: '/login' }">
						<q-icon name="person" />
					</q-btn>
					<q-btn flat rounded :to="{ path: '/logout' }">
						<q-icon name="logout" />
					</q-btn>
				</div>
				<q-select
					v-model="locale"
					:options="localeOptions"
					dense
					emit-value
					map-options
					options-dense
					style="min-width: 150px"
				/>
			</q-toolbar>
		</q-header>

		<q-page-container>
			<router-view />
		</q-page-container>
		<q-footer class="mobile-only row justify-evenly">
			<q-btn flat rounded :to="{ path: '/play' }" icon="sports_esports" />
			<q-btn flat rounded :to="{ path: '/chat' }" icon="chat" />
			<q-btn flat rounded :to="{ path: '/leaderboards' }" icon="leaderboards" />
		</q-footer>
	</q-layout>
</template>

<style lang="scss">
#header-contents {
	max-width: 1200px;
	margin: auto;
}
</style>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import options from 'src/i18n/options';
import { useQuasar } from 'quasar';
import languages from 'quasar/lang/index.json';

// #region Quasar lang definition
const defineLangs = options.map((el) => el.value);
const defineLangsSplit = options.map((el) => el.value.split('-'));
const isExist = (iso: string) =>
{
	const i = defineLangs.indexOf(iso);
	if (i !== -1)
		return defineLangs[i];
	for (const lang of defineLangsSplit)
	{
		if (lang[0] === iso || lang[1] === iso)
			return lang.join('-');
	}
	return undefined;
};

const quasarLangs = languages.filter((el) =>
{
	const ret = isExist(el.isoName);
	return !(ret === undefined);
}).map((lang) => (
	{
		label: lang.nativeName,
		quasar: lang.isoName,
		value: isExist(lang.isoName)
	}
));
// #endregion Quasar lang definition

export default defineComponent({
	name: 'MainLayout',
	setup ()
	{
		const $q = useQuasar();
		const { locale } = useI18n({ useScope: 'global' });

		watch(locale, (val) =>
		{
			for (const lang of quasarLangs)
			{
				if (lang.value === val)
				{
					import(
						/* @vite-ignore */
						`../../../node_modules/quasar/lang/${lang.quasar}`)
						.then(lang => $q.lang.set(lang.default));
				}
			}
		});

		return {
			locale,
			localeOptions: options
		};
	}
});
</script>
