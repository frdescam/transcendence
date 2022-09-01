import { reactive } from 'vue';
import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

interface Myself
{
	id?: number,
	username?: string,
	avatar?: string
}

export interface State
{
	loading: boolean,
	loggedIn: boolean,
	userStateUpdatedAt: string,
	myself: Myself
}

export type RefreshUserState = () => void;

export const state = reactive<State>({
	loading: true,
	loggedIn: false,
	userStateUpdatedAt: '',
	myself: {}
});

function refreshAllUserState ()
{
	state.userStateUpdatedAt = (new Date()).getTime().toString();
	localStorage.setItem('refreshUserState', state.userStateUpdatedAt);
	refreshLoggedState();
}

function refreshLoggedState ()
{
	state.loading = true;
	api.get('/logged')
		.then(({ data: { id, pseudo, avatar } }) =>
		{
			state.myself = {
				id,
				username: pseudo,
				avatar
			};
			state.loggedIn = true;
		})
		.catch((err: AxiosError) =>
		{
			state.loggedIn = false;
			state.myself = {};
			if (typeof err.response === 'undefined' || err.response.status !== 401)
			{
				Notify.create({
					type: 'negative',
					message: 'Failed to check login status',
					caption: err.message || (err + '')
				});
			}
		})
		.finally(() =>
		{
			state.loading = false;
		});
}

refreshLoggedState();

window.addEventListener('storage', (ev) =>
{
	if (ev.storageArea !== localStorage)
		return;
	if (ev.key === 'refreshUserState' && typeof ev.newValue === 'string' && ev.newValue !== state.userStateUpdatedAt)
	{
		state.userStateUpdatedAt = ev.newValue;
		refreshLoggedState();
	}
});

export default boot(({ app }) =>
{
	app.config.globalProperties.$state = state;
	app.provide('state', app.config.globalProperties.$state);
	app.config.globalProperties.$refreshUserState = refreshAllUserState;
	app.provide('refreshUserState', app.config.globalProperties.$refreshUserState);
});
