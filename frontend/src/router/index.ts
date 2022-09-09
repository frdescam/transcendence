/* eslint-disable @typescript-eslint/no-unused-vars */

import { route } from 'quasar/wrappers';
import {
	createMemoryHistory,
	createRouter,
	createWebHashHistory,
	createWebHistory
} from 'vue-router';

import { state } from 'src/boot/state';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */)
{
	const createHistory = process.env.SERVER
		? createMemoryHistory
		: (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

	const Router = createRouter({
		scrollBehavior: () => ({ left: 0, top: 0 }),
		routes,

		// Leave this as is and make changes in quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		history: createHistory(process.env.VUE_ROUTER_BASE)
	});

	Router.beforeEach((to, from) =>
	{
		if (!state.loggedIn)
		{
			if (state.loading)
			{
				// `from` is wrong on the initial load, so I use raw value
				if (to.name !== 'logging')
				{
					return {
						name: 'logging',
						query: {
							next: typeof window !== 'undefined' ? window.location.pathname : from.fullPath
						}
					};
				}
				else
					return;
			}
			if (to.name !== 'login' && to.name !== '2FA' && to.name !== 'party' && to.name !== 'play-list' && to.name !== 'logging')
				return { path: '/login' };
		}
	});

	return Router;
});
