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
import { defineComponent, ref } from 'vue';

export default defineComponent({
	props: [
		'matches'
	],

	setup (props)
	{
		const filteredMatches = ref([...props.matches]);
		const filter = ref('');

		async function onFilterChange (value: string)
		{
			filteredMatches.value = props.matches.filter(match => match.map.toLowerCase().includes(value.toLowerCase()) /* || match.userHome.toLowerCase().includes(value.toLowerCase()) || match.userForeign.toLowerCase().includes(value.toLowerCase()) */);
		}

		return {
			props,
			filteredMatches,
			filter,

			onFilterChange
		};
	}
});
</script>
