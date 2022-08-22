import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$axios: AxiosInstance;
	}
}

/**
 * Access directly to backend api, axios is already preconfigured on the backend
 */
export const api = axios.create({
	baseURL: `http://${document.location.hostname}:8080/api/`,
	withCredentials: true
});

export default boot(({ app }) =>
{
	app.config.globalProperties.$axios = axios;
	app.config.globalProperties.$api = api;
	app.provide('axios', app.config.globalProperties.$axios);
	app.provide('api', app.config.globalProperties.$api);
});
