import { createRouter, createWebHistory } from 'vue-router';
// Routes
import Index from '@/views/Index.vue';
import About from '@/views/About.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Index,
    },
    {
        path: '/about',
        name: 'About',
        component: About,
    }
];

export default createRouter({
    history: createWebHistory(),
    routes: routes,
});
