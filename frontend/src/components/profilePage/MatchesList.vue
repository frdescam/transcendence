<template>
	<q-list class="q-mb-md q-pb-sm shadow-2 rounded-borders bg-white">
		<q-toolbar>
			<q-toolbar-title>{{ capitalize($t('profil.matches.title')) }}</q-toolbar-title>
			<div>
				<q-input
					borderless
					dense
					debounce="300"
					v-model="filter"
					@update:model-value="onFilterChange"
					:placeholder="capitalize($t('profil.search'))"
				>
					<template v-slot:append>
						<q-icon name="search"/>
					</template>
				</q-input>
			</div>
		</q-toolbar>
		<q-item v-for="match in filteredMatches" :key="match.id">
			<q-card class="fit q-pa-md" v-bind:style="{ 'background-color': (match.winner == 1) ? 'lightblue' : 'red' }">
				<p>{{ match.timestamp }}</p>
				<div class="row justify-center">
					<q-avatar>
						<img src='https://cdn.quasar.dev/img/boy-avatar.png'>
					</q-avatar>
					<p class="q-px-sm q-my-auto">User1</p>
					<p class="q-px-sm q-my-auto">{{ match.userHomeScore }}</p>
					<p class="q-px-sm q-my-auto">-</p>
					<p class="q-px-sm q-my-auto">{{ match.userForeignScore }}</p>
					<p class="q-px-sm q-my-auto">User2</p>
					<q-avatar>
						<img src='https://cdn.quasar.dev/img/boy-avatar.png'>
					</q-avatar>
				</div>
				<p class="text-center q-mb-none">{{ $t('profil.matches.title', { map: match.map }) }}</p>
			</q-card>
		</q-item>
			<div v-if="filteredMatches.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
				<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
				{{ capitalize($t('profil.noMatch')) }}
			</div>
			<div v-if="filteredMatches.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
				<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
				{{ capitalize($t('profil.noData')) }}
			</div>
	</q-list>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { Capitalize } from 'src/boot/libs';

export default defineComponent({
	props: [
		'matches'
	],

	setup (props)
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const filteredMatches = ref([...props.matches]);
		const filter = ref('');

		async function onFilterChange (value: string | number | null)
		{
			if (typeof value === 'string')
				filteredMatches.value = props.matches.filter((match: any) => match.map.toLowerCase().includes(value.toLowerCase()) /* || match.userHome.toLowerCase().includes(value.toLowerCase()) || match.userForeign.toLowerCase().includes(value.toLowerCase()) */);
		}

		return {
			capitalize,

			props,
			filteredMatches,
			filter,

			onFilterChange
		};
	}
});
</script>
