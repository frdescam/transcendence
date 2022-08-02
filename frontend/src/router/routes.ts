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
		path: '/play',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/GameCreation.vue') }]
	},

	{
		path: '/play/matching',
		name: 'matching',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Matching.vue') }]
	},

	{
		path: '/game/:party',
		name: 'party',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Game.vue') }]
	},

	{
		path: '/leaderboard',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Leaderboard.vue') }]
	},

	{
		path: '/friends',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Friends.vue') }]
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

	{
		path: '/profile2',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/Profile2.vue') }]
	},

	{
		path: '/profile',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', component: () => import('src/views/pages/ProfilePage.vue') }]
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('src/views/pages/Error.vue')
	}
];

export default routes;
