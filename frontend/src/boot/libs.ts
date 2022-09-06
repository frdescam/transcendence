/* eslint-disable @typescript-eslint/no-explicit-any */
import { boot } from 'quasar/wrappers';
import sanitizeHtml from 'sanitize-html';
import { ComposerTranslation } from 'vue-i18n';

export interface TypeOfObject {
	(object: any): any;
}

export interface Timestamp {
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number
}

export interface TimestampFunction {
	(timestamp: string): Timestamp;
}

export interface ObjDiff {
	(obj1: any, obj2: any): any
}

export interface SanitizeMessage {
	(message: string): string[];
}

export interface Capitalize {
  (str: string): string;
}

export interface GetTraduction {
  (key: string, t: ComposerTranslation, href?: string): string;
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$typeofObject: TypeOfObject;
		$timestamp: TimestampFunction;
		$objDiff: ObjDiff,
		$sanitizeMessage: SanitizeMessage,
		$capitalize: Capitalize,
		$getTraduction: GetTraduction
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
		year: 0,
		month: 0,
		day: 0,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0
	};
	const ret = /^(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{1,2})T(?<hour>\d{1,2}):(?<minute>\d{1,2}):(?<second>\d{1,2}).(?<millisecond>\d+)Z$/.exec(timestamp);
	if (ret?.groups)
	{
		data.year = Number(ret.groups.year);
		data.month = Number(ret.groups.month);
		data.day = Number(ret.groups.day);
		data.hour = Number(ret.groups.hour);
		data.minute = Number(ret.groups.minute);
		data.second = Number(ret.groups.second);
		data.millisecond = Number(ret.groups.millisecond);
	}
	return data;
};

/**
 * Get difference(s) between two object
 * @param {any} obj1 first object
 * @param {any} obj2 second object
 * @returns {any} object contains difference(s)
 */
const objDiff = (obj1: any, obj2: any): any =>
{
	const result: any = {};
	if (Object.is(obj1, obj2))
		return undefined;
	if (!obj2 || typeof obj2 !== 'object')
		return obj2;
	Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key =>
	{
		if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key]))
			result[key] = obj2[key];
		if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object')
		{
			const value = objDiff(obj1[key], obj2[key]);
			if (value !== undefined)
				result[key] = value;
		}
	});
	return result;
};

/**
 * Sanitize, split and clean user message coming from textbox
 * @param message user message
 * @returns array of messages
 */
const sanitizeUserMessage = (message: string) =>
{
	const BR = '<br />';
	const DIV = '<div>';
	const _DIV = '</div>';

	message = sanitizeHtml(message, {
		allowedTags: ['b', 'i', 'u', 'strike', 'hr', 'div', 'br'],
		disallowedTagsMode: 'discard',
		selfClosing: ['br', 'hr']
	});
	if (!message.startsWith(DIV, 0))
	{
		if (message === BR)
			return '';
		return message;
	}

	const newMessages: Array<string> = message.split(DIV).map((str) => str.replaceAll(_DIV, '')).filter((el) => el.length);
	for (let i = 0; i < newMessages.length; i++)
	{
		if (/.<br \/>/.test(newMessages[i]))
		{
			const temp = newMessages[i].slice(0, newMessages[i].length - 6);
			newMessages.splice(Number(i), 1, temp);
			newMessages.splice(Number(i++), 0, BR);
		}
	}
	let index = 0;
	while (index !== -1)
	{
		index = newMessages.indexOf(BR, index + 1);
		if (newMessages[index] === BR)
			newMessages.splice(index--, 1);
	}
	if (newMessages[0] === BR)
		newMessages.shift();
	if (newMessages[newMessages.length - 1] === BR)
		newMessages.pop();

	let ret = DIV;
	for (let i = 0; i <= newMessages.length - 1; i++)
	{
		ret += newMessages[i];
		if (i < newMessages.length - 1)
			ret += BR;
	}
	ret += _DIV;
	return ret;
};

/**
 * Capitalize first letter of string
 * @param str string to capitalize
 * @return string
 */
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Automatically get traduction of element
 * Work with pathname of url, for exemple:
 * if pathname if `/one/two/three` and key `hello`, this function search `one.two.three.hello` key
 * @param key key to search
 * @param href href of current page, by default is `window.location.href`
 * @return traducted element of passed key if is not found
 */
const getTraduction = (
	key: string,
	t: ComposerTranslation,
	href: string = window.location.href
): string =>
{
	const pathname = new URL(href).pathname.slice(1);
	const index = `${pathname.split('/').join('.')}.${key}`;
	try
	{
		return t(index);
	}
	catch (_err)
	{
		return key;
	}
};

export default boot(({ app }) =>
{
	app.config.globalProperties.$typeofObject = typeofObject;
	app.provide('typeofObject', app.config.globalProperties.$typeofObject);
	app.config.globalProperties.$timestamp = timestamp;
	app.provide('timestamp', app.config.globalProperties.$timestamp);
	app.config.globalProperties.$objDiff = objDiff;
	app.provide('objDiff', app.config.globalProperties.$objDiff);
	app.config.globalProperties.$sanitizeMessage = sanitizeUserMessage;
	app.provide('sanitizeMessage', app.config.globalProperties.$sanitizeMessage);
	app.config.globalProperties.$capitalize = capitalize;
	app.provide('capitalize', app.config.globalProperties.$capitalize);
	app.config.globalProperties.$getTraduction = getTraduction;
	app.provide('getTraduction', app.config.globalProperties.$getTraduction);
});
