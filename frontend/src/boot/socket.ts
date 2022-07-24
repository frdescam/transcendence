import { boot } from 'quasar/wrappers';
import { Manager, Socket } from 'socket.io-client';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$socketChat: Socket,
	}
}

const manager = new Manager('http://localhost:8080', {
	autoConnect: true
});
const chat = manager.socket('/chat::');

export default boot(({ app }) =>
{
	app.config.globalProperties.$socketChat = chat;
	app.provide('socketChat', app.config.globalProperties.$socketChat);
});
