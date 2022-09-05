import type { RouteRecordRaw } from 'vue-router';

export interface LayoutTab {
	label: string,
	icon: string
	route: RouteRecordRaw
}
export type LayoutTabs = LayoutTab[];