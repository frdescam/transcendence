import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Index.vue') }]
	},

	{
		path: '/chat',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Chat.vue') }]
	},

	{
		path: '/play/matching',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'matching', component: () => import('src/views/pages/Matching.vue') }]
	},

	{
		path: '/game/:party',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'party', component: () => import('src/views/pages/Game.vue') }]
	},

	{
		path: '/userstatus/:userId',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'userstatus', component: () => import('src/views/pages/UserStatus.vue') }]
	},

	{
		path: '/login',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/LoginPage.vue') }]
	},

	{
		path: '/register',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/RegisterPage.vue') }]
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('src/views/pages/Error.vue')
	}
];

export default routes;
