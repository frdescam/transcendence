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
					Transendance
				</q-toolbar-title>
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

		<q-drawer
			v-model="leftDrawerOpen"
			show-if-above
			bordered
		>
			<q-list>
				<div>Hello</div>
				<router-link :to="{ path: '/chat' }"></router-link>
			</q-list>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import options from '../../i18n/options';
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
		const leftDrawerOpen = ref(false);
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
			leftDrawerOpen,
			locale,
			localeOptions: options,
			toggleLeftDrawer ()
			{
				leftDrawerOpen.value = !leftDrawerOpen.value;
			}
		};
	}
});
</script>
