/* eslint-disable @typescript-eslint/no-explicit-any */
import { boot } from 'quasar/wrappers';

export interface TypeOfObject {
  (object: any): any;
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		// eslint-disable-next-line @typescript-eslint/ban-types
		$typeofObject: TypeOfObject;
	}
}

/**
 * Get typeof object
 * @param {any} object - Object to analyse
 * @returns {string} typeof pass object
 */
const typeofObject = (object: any): string =>
{
	if (object === null)
		return 'null';
	if (object.constructor === String)
		return 'string';
	if (object.constructor === Array)
		return 'array';
	if (object.constructor === Object)
		return 'object';
	return 'undefined';
};

export default boot(({ app }) =>
{
	app.config.globalProperties.$typeofObject = typeofObject;
	app.provide('typeofObject', app.config.globalProperties.$typeofObject);
});
