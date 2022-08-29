import { api } from 'src/boot/axios';
import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'home', component: () => import('src/views/pages/WelcomePage.vue') }]
	},

	{
		path: '/chat',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'chat', component: () => import('src/views/pages/Chat.vue') }]
	},

	{
		path: '/play',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'play', component: () => import('src/views/pages/GameCreation.vue') }]
	},

	{
		path: '/play/list',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'gamelist', component: () => import('src/views/pages/List.vue') }]
	},

	{
		path: '/play/matching',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'matching', component: () => import('src/views/pages/Matching.vue') }]
	},

	{
		path: '/listgames',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'matching', component: () => import('src/views/pages/List.vue') }]
	},

	{
		path: '/game/:party',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'party', component: () => import('src/views/pages/Game.vue') }]
	},

	{
		path: '/leaderboard',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'leaderboard', component: () => import('src/views/pages/Leaderboard.vue') }]
	},

	{
		path: '/friends',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'friends', component: () => import('src/views/pages/Friends.vue') }]
	},

	{
		path: '/login',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{
			path: '',
			name: 'login',
			component: () => import('src/views/pages/LoginPage.vue'),
			beforeEnter: async () =>
			{
				let isLogged = true;
				await api.get('/logged').catch(() =>
				{
					isLogged = false;
				});
				if (isLogged)
					return { path: '/' };
			}
		}]
	},

	{
		path: '/login/2FA',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{
			path: '',
			name: '2FA',
			component: () => import('src/views/pages/2FA.vue'),
			beforeEnter: async () =>
			{
				let isLogged = true;
				await api.get('/logged').catch(() =>
				{
					isLogged = false;
				});
				if (isLogged)
					return { path: '/' };
			}
		}]
	},

	{
		path: '/profile/:id',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'profile', component: () => import('src/views/pages/ProfilePage.vue') }]
	},

	{
		path: '/settings',
		component: () => import('src/views/layouts/Main.vue'),
		children: [{ path: '', name: 'settings', component: () => import('src/views/pages/UserSettings.vue') }]
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('src/views/pages/Error.vue')
	}
];

export default routes;
