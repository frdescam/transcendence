<template>
	<q-list class="q-mb-md q-pb-sm rounded-borders shadow-2">
		<q-toolbar>
			<q-toolbar-title>Achievements</q-toolbar-title>
				<div>
				<q-input borderless dense debounce="300" v-model="filter" @update:model-value="onFilterChange" placeholder="Search">
					<template v-slot:append>
						<q-icon name="search"/>
					</template>
				</q-input>
			</div>
		</q-toolbar>
		<q-item v-for="achievement in filteredAchievements" :key="achievement.id">
			<q-card class="fit row justify-between q-pa-md">
				<div class="column">
					<p>{{ achievement.timestamp }}</p>
					<p class="q-mb-sm">{{ achievement.achievementName }}</p>
					<q-item-label caption>{{ achievement.achievementDescription }}</q-item-label>
				</div>
				<q-avatar size="75px">
					<img :src='achievement.achievementIcon'>
				</q-avatar>
			</q-card>
		</q-item>
		<div v-if="filteredAchievements.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
			<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
			No matching records found
		</div>
		<div v-if="filteredAchievements.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
			<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
			No data available
		</div>
	</q-list>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	props: [
		'achievements'
	],
	setup (props)
	{
		const filteredAchievements = ref([...props.achievements]);
		const filter = ref('');

		async function onFilterChange (value: string)
		{
			filteredAchievements.value = props.achievements.filter(achievement => achievement.achievementName.toLowerCase().includes(value.toLowerCase()) || achievement.achievementDescription.toLowerCase().includes(value.toLowerCase()) /* || match.userForeign.toLowerCase().includes(value.toLowerCase()) */);
		}

		return {
			props,
			filter,
			filteredAchievements,

			onFilterChange
		};
	}
});
</script>
