/* eslint-disable @typescript-eslint/no-explicit-any */

import { boot } from 'quasar/wrappers';
import { Quasar } from 'quasar';
import langs from 'src/i18n/options';

interface langDefinition {
	label: string,
	value: string,
	import: any
}

export default boot(async () =>
{
	const data: langDefinition[] = [];

	for (const lang of langs)
	{
		const __import = await import(`../../node_modules/quasar/lang/${lang.import}.mjs`);
		data.push({
			label: lang.label,
			value: lang.value,
			import: __import
		});
	}
	window.addEventListener('lang::change', (e: any) =>
	{
		for (const lang of data)
		{
			if (lang.value === e.detail.value)
			{
				Quasar.lang.set(lang.import.default);
				break;
			}
		}
	}, false);

	window.dispatchEvent(new CustomEvent('lang::change', {
		detail: {
			value: langs[0].value
		},
		bubbles: true,
		cancelable: true,
		composed: false
	}));
});
