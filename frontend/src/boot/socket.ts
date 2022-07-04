import { boot } from 'quasar/wrappers';
import io, { Socket } from 'socket.io-client';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$socket: Socket,
	}
}

const socket = io('http://localhost:8080/');

export default boot(({ app }) =>
{
	app.config.globalProperties.$socket = socket;
	app.provide('socket', app.config.globalProperties.$socket);
});
