import { Quasar } from 'quasar';
import langs from 'src/i18n/options';

const list = langs.map((el) => el.value).join('|');
const langList = import.meta.glob(`../../node_modules/quasar/lang/(${list}).mjs`);

export default async () =>
{
	window.onstorage = () =>
	{
		try
		{
			langList[`../../node_modules/quasar/lang/${localStorage.getItem('transcendance_lang')}.mjs`]().then((lang) =>
			{
				Quasar.lang.set(lang.default);
			});
		}
		catch (err)
		{
			// just catch error for not breaking app
		}
	};

	if (!localStorage.getItem('transcendance_lang'))
		localStorage.setItem('transcendance_lang', langs[0].value);
};
