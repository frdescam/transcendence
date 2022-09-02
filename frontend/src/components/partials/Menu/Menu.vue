<template>
	<q-toolbar class="q-pr-none">

		<q-toolbar-title shrink class="gt-sm">
			<q-btn flat round dense size="lg" icon="mdi-table-tennis" :to="{ name: 'home' }"/>
			{{ capitalize($t('menu.title')) }}
		</q-toolbar-title>

		<div :class="clsx('col-grow row no-wrap', $q.screen.gt.xs ? 'q-gutter-md' : 'q-gutter-sm', $q.screen.gt.xs && 'justify-center')">
			<q-btn flat :rounded="$q.screen.gt.xs" :round="$q.screen.lt.sm" :to="{ name: 'play' }" :label="$q.screen.gt.xs ? $t('menu.play') : undefined" icon="sports_esports" />
			<q-btn flat :rounded="$q.screen.gt.xs" :round="$q.screen.lt.sm" :to="{ name: 'chat' }" :label="$q.screen.gt.xs ? $t('menu.chat') : undefined" icon="chat" />
			<q-btn flat :rounded="$q.screen.gt.xs" :round="$q.screen.lt.sm" :to="{ name: 'leaderboard' }" :label="$q.screen.gt.xs ? $t('menu.leaderboard') : undefined" icon="leaderboard" />
		</div>

		<q-select
			rounded
			borderless
			dense
			options-dense
			:options-dark="false"
			:hide-selected="$q.screen.lt.lg"
			dark
			emit-value
			map-options
			v-model="locale"
			:options="localeOptions"
			:class="clsx($q.screen.gt.md && 'lang_allocated_space')"
		>
			<template v-slot:prepend v-if="$q.screen.gt.md">
				<q-icon name="translate" />
			</template>
			<template v-slot:append v-if="$q.screen.lt.lg">
				<q-icon name="translate" />
			</template>
		</q-select>

    <MenuUser/>

	</q-toolbar>
</template>

<script lang="ts">
import clsx from 'clsx';
import { defineComponent, inject, watch } from 'vue';
import { Capitalize } from 'src/boot/libs';
import { useI18n } from 'vue-i18n';
import options from 'src/i18n/options';
import { useQuasar } from 'quasar';
import languages from 'quasar/lang/index.json';
import { api } from 'boot/axios';
import { useRouter } from 'vue-router';

import MenuUser from '../Menu/MenuUser.vue';

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
	name: 'PartialMenu',
	components: {
		MenuUser
	},
	setup ()
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const $q = useQuasar();
		const { locale } = useI18n({ useScope: 'global' });
		const router = useRouter();

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

		function onLogout ()
		{
			api.get('/logout');
			router.push('/login');
		}

		return {
			clsx,
			locale,
			localeOptions: options,

			onLogout,
			capitalize
		};
	}
});
</script>

<style scoped>
.inherit_color
{
	color: inherit;
}
.lang_allocated_space
{
	min-width: 120px;
}
</style>
