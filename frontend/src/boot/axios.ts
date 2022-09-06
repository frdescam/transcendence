import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { Notify } from 'quasar';
import type { AxiosError, AxiosResponse } from 'axios';

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

export type catchAxiosType = ((got: Promise<AxiosResponse<unknown> | void>) => Promise<AxiosResponse<unknown> | void>);
function catchAxios (got: Promise<AxiosResponse<unknown> | void>): Promise<AxiosResponse<unknown> | void>
{
	return (
		got.catch(
			(err: AxiosError) =>
			{
				Notify.create({
					progress: true,
					timeout: 10000,
					type: 'negative',
					message: err.message,
					caption: typeof err.cause !== 'undefined' ? (err.cause + '') : undefined
				});
			}
		)
	);
}

export type printAxiosErrorType = ((err: AxiosError) => void);
function printAxiosError (err: AxiosError): void
{
	Notify.create({
		progress: true,
		timeout: 10000,
		type: 'negative',
		message: err.message,
		caption: typeof err.cause !== 'undefined' ? (err.cause + '') : undefined
	});
}

export default boot(({ app }) =>
{
	app.config.globalProperties.$axios = axios;
	app.config.globalProperties.$api = api;
	app.config.globalProperties.$catchAxios = catchAxios;
	app.config.globalProperties.$printAxiosError = printAxiosError;
	app.provide('axios', app.config.globalProperties.$axios);
	app.provide('api', app.config.globalProperties.$api);
	app.provide('catchAxios', app.config.globalProperties.$catchAxios);
	app.provide('printAxiosError', app.config.globalProperties.$printAxiosError);
});
