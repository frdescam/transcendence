// Quasar
import { Quasar } from 'quasar'
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import 'quasar/src/css/index.sass'
// Vue
import { createApp } from 'vue'
import Router from './routers/index';
import App from './App.vue'

createApp(App)
.use(Quasar, {
    plugins: {}
})
.use(Router)
.mount('#app');
