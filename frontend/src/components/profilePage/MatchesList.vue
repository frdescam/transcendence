<template>
	<q-list class="q-mb-md q-pb-sm shadow-2 rounded-borders bg-white">
		<q-toolbar>
			<q-toolbar-title>Matches</q-toolbar-title>
			<div>
				<q-input borderless dense debounce="300" v-model="filter" @update:model-value="onFilterChange" placeholder="Search">
					<template v-slot:append>
						<q-icon name="search"/>
					</template>
				</q-input>
			</div>
		</q-toolbar>
		<q-item v-for="match in filteredMatches" :key="match.id">
			<q-card class="fit q-pa-md" v-bind:style="{ 'background-color': (match.winner.id == user.id) ? 'lightblue' : 'red' }">
				<p>{{ date.formatDate(match.timestamp, 'DD/MM/YYYY HH:mm') }}</p>
				<div class="row justify-center">
					<q-avatar>
						<img :src='match.userHome.avatar'>
					</q-avatar>
					<p class="q-px-sm q-my-auto">{{ match.userHome.pseudo }}</p>
					<p class="q-px-sm q-my-auto">{{ match.userHomeScore }}</p>
					<p class="q-px-sm q-my-auto">-</p>
					<p class="q-px-sm q-my-auto">{{ match.userForeignScore }}</p>
					<p class="q-px-sm q-my-auto">{{ match.userForeign.pseudo }}</p>
					<q-avatar>
						<img :src='match.userForeign.avatar'>
					</q-avatar>
				</div>
				<p class="text-center q-mb-none">map : {{ match.map }}</p>
			</q-card>
		</q-item>
			<div v-if="filteredMatches.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
				<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
				No matching records found
			</div>
			<div v-if="filteredMatches.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
				<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
				No data available
			</div>
	</q-list>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { date } from 'quasar';

export default defineComponent({
	props: [
		'matches',
		'user'
	],

	setup (props)
	{
		const filteredMatches = ref([...props.matches]);
		const filter = ref('');

		async function onFilterChange (value: string)
		{
			filteredMatches.value = props.matches.filter(match => match.map.toLowerCase().includes(value.toLowerCase()) || match.userHome.pseudo.toLowerCase().includes(value.toLowerCase()) || match.userForeign.pseudo.toLowerCase().includes(value.toLowerCase()));
		}

		onMounted(() =>
		{
			watch(() => props.matches, () =>
			{
				onFilterChange(filter.value);
			},
			{
				flush: 'post'
			});
		});

		return {
			props,
			filteredMatches,
			filter,

			onFilterChange,
			date
		};
	}
});
</script>
