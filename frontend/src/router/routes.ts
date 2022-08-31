import { api } from 'src/boot/axios';
import { RouteRecordRaw } from 'vue-router';
import type { LayoutTabs } from 'src/views/layouts/Tabs';

const backgrounds = {
	cactus: {
		background: '/bg/thiago-wimberly-3HrBXxl82e0-unsplash.jpg',
		backgroundColor: '#01da7f'
	},
	sunset_tree: {
		background: '/bg/prometey-sanchez-noskov-c6M7AoevSXE-unsplash.jpg',
		backgroundColor: '#fc765b'
	},
	dj_tweak: {
		background: '/bg/marcela-laskoski-YrtFlrLo2DQ-unsplash.jpg',
		backgroundColor: '#7706c8'
	},
	leaderboard: {
		background: '/bg/element5-digital-LTyDj7u_TU4-unsplash.jpg',
		backgroundColor: '#201717'
	},
	gaming_alt: {
		background: '/bg/designnn-co-VK0RLlrPObY-unsplash.jpg',
		backgroundColor: '#140f16'
	},
	somthing_wrong: {
		background: '/bg/artur-wayne-vfTPbPfW9ak-unsplash.jpg',
		backgroundColor: '#140f16'
	},
	keyboard: {
		background: '/bg/anas-alshanti-feXpdV001o4-unsplash.jpg',
		backgroundColor: '#00185b'
	},
	rainy_street: {
		background: '/bg/alex-knight-X3e32F00Ytc-unsplash.jpg',
		backgroundColor: '#4b4246'
	},
	ferris_wheel: {
		background: '/bg/alex-knight-agOqSnfiyPo-unsplash.jpg',
		backgroundColor: '#000404'
	},
	gaming: {
		background: '/bg/alexey-savchenko-k4Akpt5-Sfk-unsplash.jpg',
		backgroundColor: '#26262e'
	},
	ft_login: {
		background: '/bg/42-login.png',
		backgroundColor: '#2e849b'
	}
};

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('src/views/layouts/Standard.vue'),
		children: [{ path: '', name: 'home', component: () => import('src/views/pages/WelcomePage.vue') }],
		meta: {
			...(backgrounds.sunset_tree)
		}
	},

	{
		path: '/chat',
		component: () => import('src/views/layouts/None.vue'),
		children: [{ path: '', name: 'chat', component: () => import('src/views/pages/Chat.vue') }],
		meta: {
			...(backgrounds.keyboard)
		}
	},

	{
		path: '/play',
		component: () => import('src/views/layouts/Tabs.vue'),
		children: [
			{ path: '', name: 'play', component: () => import('src/views/pages/GameMatching.vue') },
			{ path: 'create', name: 'play-create', component: () => import('src/views/pages/GameCreation.vue') },
			{ path: 'list', name: 'play-list', component: () => import('src/views/pages/List.vue') }
		],
		meta: {
			...(backgrounds.gaming),
			tabs: [
				{
					icon: 'sports_esports',
					label: 'Matching',
					route: { name: 'play' }
				},
				{
					icon: 'add_circle',
					label: 'Create',
					route: { name: 'play-create' }
				},
				{
					icon: 'list',
					label: 'Explore',
					route: { name: 'play-list' }
				}
			] as LayoutTabs
		}
	},

	{
		path: '/play/matching',
		component: () => import('src/views/layouts/None.vue'),
		children: [{ path: '', name: 'matching', component: () => import('src/views/pages/Matching.vue') }],
		meta: {
			...(backgrounds.gaming_alt)
		}
	},

	{
		path: '/game/:party',
		component: () => import('src/views/layouts/Standard.vue'),
		children: [{ path: '', name: 'party', component: () => import('src/views/pages/Game.vue') }],
		meta: {
			...(backgrounds.rainy_street)
		}
	},

	{
		path: '/leaderboard',
		component: () => import('src/views/layouts/Standard.vue'),
		children: [{ path: '', name: 'leaderboard', component: () => import('src/views/pages/Leaderboard.vue') }],
		meta: {
			...(backgrounds.leaderboard)
		}
	},

	{
		path: '/friends',
		component: () => import('src/views/layouts/Standard.vue'),
		children: [{ path: '', name: 'friends', component: () => import('src/views/pages/Friends.vue') }],
		meta: {
			...(backgrounds.cactus)
		}
	},

	{
		path: '/login',
		component: () => import('src/views/layouts/Centered.vue'),
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
		}],
		meta: {
			...(backgrounds.ft_login)
		}
	},

	{
		path: '/login/2FA',
		component: () => import('src/views/layouts/Centered.vue'),
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
		}],
		meta: {
			...(backgrounds.ft_login)
		}
	},

	{
		path: '/profile/:id',
		component: () => import('src/views/layouts/None.vue'),
		children: [{ path: '', name: 'profile', component: () => import('src/views/pages/ProfilePage.vue') }],
		meta: {
			...(backgrounds.sunset_tree)
		}
	},

	{
		path: '/settings',
		component: () => import('src/views/layouts/Standard.vue'),
		children: [{ path: '', name: 'settings', component: () => import('src/views/pages/UserSettings.vue') }],
		meta: {
			...(backgrounds.dj_tweak)
		}
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('src/views/pages/Error.vue')
	}
];

export default routes;
