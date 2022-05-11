// Quasar
import { Quasar, AppFullscreen, Notify } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import 'quasar/src/css/index.sass';
// Vue
import { createApp } from 'vue';
import router from './routers/index';
import Main from './views/layouts/Main.vue';

createApp(Main)
.use(Quasar, {
	plugins: {
		AppFullscreen,
		Notify,
	},
	config: {
		notify: {
			type: 'positive',
			color: 'primary',
			textColor: 'primary',
			message: 'notify',
			html: false
		}
	}
})
.use(router)
.mount('#app');
