<template>
	<q-list class="q-mb-md q-pb-sm rounded-borders shadow-2 bg-white scroll" style="max-height: 800px">
		<q-toolbar>
			<q-toolbar-title>{{ capitalize($t('profil.achievements.title')) }}</q-toolbar-title>
				<div>
				<q-input
					borderless
					dense
					debounce="300"
					v-model="filter"
					:placeholder="capitalize($t('profil.search'))"
					@update:model-value="onFilterChange"
				>
					<template v-slot:append>
						<q-icon name="search"/>
					</template>
				</q-input>
			</div>
		</q-toolbar>
		<q-item v-for="achievement in filteredAchievements" :key="achievement.id">
			<q-card class="fit row justify-between q-pa-md">
				<div class="column">
					<p class="q-mb-sm">{{ achievement.name }}</p>
					<q-item-label caption>{{ achievement.description }}</q-item-label>
				</div>
				<q-avatar size="75px">
					<img :src='achievement.image'>
				</q-avatar>
			</q-card>
		</q-item>
		<div v-if="filteredAchievements.length == 0 && filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
			<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
			{{ capitalize($t('profil.noMatch')) }}
		</div>
		<div v-if="filteredAchievements.length == 0 && !filter" class="text-center q-pa-md q-ma-md shadow-2 rounded-borders">
			<q-icon name="warning" size="1.5rem" class="q-mr-sm"></q-icon>
			{{ capitalize($t('profil.noData')) }}
		</div>
	</q-list>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject, ref, watch } from 'vue';
import { Capitalize } from 'src/boot/libs';

export default defineComponent({
	props: [
		'achievements'
	],
	setup (props)
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const filteredAchievements = ref([...props.achievements]);
		const filter = ref('');

		async function onFilterChange (value: string | number | null)
		{
			if (typeof value === 'string')
				filteredAchievements.value = props.achievements.filter((achievement: any) => achievement.achievementName.toLowerCase().includes(value.toLowerCase()) || achievement.achievementDescription.toLowerCase().includes(value.toLowerCase()) /* || match.userForeign.toLowerCase().includes(value.toLowerCase()) */);
		}

		onMounted(() =>
		{
			watch(() => props.achievements, () =>
			{
				onFilterChange(filter.value);
			},
			{
				flush: 'post'
			});
		});

		return {
			capitalize,

			props,
			filter,
			filteredAchievements,

			onFilterChange
		};
	}
});
</script>
