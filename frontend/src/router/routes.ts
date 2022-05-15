import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('src/views/layouts/MainLayout.vue'),
		children: [{ path: '', component: () => import('src/views/pages/IndexPage.vue') }]
	},

	{
		path: '/chat',
		component: () => import('src/views/layouts/MainLayout.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Chat.vue') }]
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('src/views/pages/ErrorNotFound.vue')
	}
];

export default routes;
