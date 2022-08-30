<template>
	<None>
		<q-page class="full-width row wrap justify-center" padding>
			<div class="col-12 col-xl-7 col-lg-9 col-md-12 col-sm-12 col-xs-12">
				<q-tabs align="justify" stretch inline-label :breakpoint="500" class="bg-secondary text-white shadow-3 rounded-borders" dense>
					<q-route-tab
						v-for="tab in tabs"
						v-bind:key="tab.label"
						:icon="tab.icon"
						:label="tab.label"
						:to="tab.route"
						exact
					/>
				</q-tabs>
				<router-view v-slot="{ Component, route }">
					<div class="content_container q-py-md">
						<transition :name="getTransitionName(route.matched[0], route.name)">
							<div :key="route.path">
								<component :is="Component" />
							</div>
						</transition>
					</div>
				</router-view>
			</div>
		</q-page>
	</None>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import None from './None.vue';
import type { RouteRecordNormalized, RouteRecordRaw, RouteRecordName } from 'vue-router';

export interface LayoutTab {
	label: string,
	icon: string
	route: RouteRecordRaw
}
export type LayoutTabs = LayoutTab[];

const tabIndex = ref(0);

function getTransitionName (parent: RouteRecordNormalized, currentName: RouteRecordName | null | undefined): string | undefined
{
	if (!currentName)
		return undefined;

	const currentIndex = parent.children.findIndex(
		({ name }) => (name === currentName)
	);
	const oldIndex = tabIndex.value;
	tabIndex.value = currentIndex;
	return (tabIndex.value < oldIndex ? 'fade-right' : 'fade-left');
}

export default defineComponent({
	name: 'CenteredLayout',
	components: {
		None
	},
	setup ()
	{
		const route = useRoute();
		const tabs: LayoutTabs = ('tabs' in route.meta) ? route.meta.tabs as LayoutTabs : [];

		return {
			tabs,
			getTransitionName
		};
	}
});
</script>

<style>
.content_container
{
		display: grid;
}
.content_container > *
{
		grid-area: 1 / 1 / 1 / 1;
}
</style>
