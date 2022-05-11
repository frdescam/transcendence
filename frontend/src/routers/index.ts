import { createRouter, createWebHistory } from 'vue-router';
import Index from '@/views/pages/Index.vue';
import Login from '@/views/pages/Login.vue';

/**
 * Connect historyAPI to vue router
 */

const routes = [
	{
		path: '/',
		name: 'Index',
		component: Index,
	},
	{
		path: '/login',
		name: 'Login',
		component: Login,
	}
];

export default createRouter({
	history: createWebHistory(),
	routes,
});
