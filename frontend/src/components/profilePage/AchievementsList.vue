<template>
	<q-list class="q-mb-md q-pb-sm rounded-borders shadow-2">
		<q-toolbar>
			<q-toolbar-title>Achievements</q-toolbar-title>
				<div>
				<q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
					<template v-slot:append>
						<q-icon name="search"/>
					</template>
				</q-input>
			</div>
		</q-toolbar>
		<q-item v-for="achievement in achievements" :key="achievement.id">
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
	</q-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	props: [
		'achievements'
	],
	setup (props)
	{
		return {
			props
		};
	}
});
</script>
