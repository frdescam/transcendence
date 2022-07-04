/* eslint-disable @typescript-eslint/no-explicit-any */
import { boot } from 'quasar/wrappers';

export interface TypeOfObject {
	(object: any): any;
}

export interface Timestamp {
	year: string,
	month: string,
	day: string,
	hour: string,
	minute: string,
	second: string,
	millisecond: string
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$typeofObject: TypeOfObject;
	}
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$timestamp: Timestamp;
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

/**
 * Parse database timestamp
 * @param {string} timestamp - timestamp
 * @returns {Timestamp} timestamp parsed
 */
const timestamp = (timestamp: string): Timestamp =>
{
	const data: Timestamp = {
		year: '',
		month: '',
		day: '',
		hour: '',
		minute: '',
		second: '',
		millisecond: ''
	};
	const ret = /^(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{1,2})T(?<hour>\d{1,2}):(?<minute>\d{1,2}):(?<second>\d{1,2}).(?<millisecond>\d+)Z$/.exec(timestamp);
	if (ret?.groups)
	{
		data.year = ret.groups.year;
		data.month = ret.groups.month;
		data.day = ret.groups.day;
		data.hour = ret.groups.hour;
		data.minute = ret.groups.minute;
		data.second = ret.groups.second;
		data.millisecond = ret.groups.millisecond;
	}
	return data;
};

export default boot(({ app }) =>
{
	app.config.globalProperties.$typeofObject = typeofObject;
	app.provide('typeofObject', app.config.globalProperties.$typeofObject);
	app.config.globalProperties.$timestamp = timestamp;
	app.provide('timestamp', app.config.globalProperties.$timestamp);
});
