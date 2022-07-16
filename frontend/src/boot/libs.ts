/* eslint-disable @typescript-eslint/no-explicit-any */
import { boot } from 'quasar/wrappers';
import sanitizeHtml from 'sanitize-html';

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

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$typeofObject: TypeOfObject;
		$timestamp: TimestampFunction;
		$objDiff: ObjDiff,
		$sanitizeMessage: SanitizeMessage
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
	message = sanitizeHtml(message, {
		allowedTags: ['b', 'i', 'u', 'strike', 'hr', 'div', 'br'],
		disallowedTagsMode: 'discard',
		selfClosing: ['br', 'hr']
	});
	if (!message.startsWith('<div>', 0))
	{
		if (message === '<br />')
			return '';
		return message;
	}
	const newMessages = message.split('<div>').map((str) => str.replaceAll('</div>', ''));
	const __continue = {
		start: true,
		end: true
	};
	while (__continue.start || __continue.end)
	{
		if (__continue.start &&
			newMessages[0].replaceAll('<br />', '').length <= 0)
			newMessages.splice(0, 1);
		else
			__continue.start = false;
		if (__continue.end &&
			newMessages[newMessages.length - 1].replaceAll('<br />', '').length <= 0)
			newMessages.splice(newMessages.length - 1, 1);
		else
			__continue.end = false;
	}
	let ret = '<div>';
	for (let i = 0; i <= newMessages.length - 1; i++)
	{
		ret += newMessages[i];
		if (!/<br \/>$/gm.test(newMessages[i]))
			ret += '<br />';
	}
	ret += '</div>';
	return ret;
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
});
