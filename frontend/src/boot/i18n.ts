import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

export default boot(({ app }) =>
{
	const i18n = createI18n({
		legacy: false,
		globalInjection: true,
		locale: 'en-US',
		fallbackLocale: 'en-US',
		messages
	});
	app.use(i18n);
});
