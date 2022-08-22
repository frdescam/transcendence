import { BasicShadowMap, PCFSoftShadowMap } from 'three';

import type { ShadowMapType } from 'three';

type quality = {
	pixelRatio: number | 'device';
	critical?: boolean,
	allowedEffects?: string[];
	useShadowmap: boolean;
	shadowmap?: ShadowMapType;
	shadowmapSize?: number;
	reflection: boolean;
	reflectionQuality?: number;
	reflectionMultisample?: number;
	canUseSkyboxAsEnvironment: boolean;
};

const qualities: quality[] = [
	{
		pixelRatio: 0.5,
		critical: true,
		useShadowmap: false,
		shadowmap: undefined,
		reflection: false,
		canUseSkyboxAsEnvironment: false
	},
	{
		pixelRatio: 0.75,
		allowedEffects: ['bloom'],
		useShadowmap: true,
		shadowmap: BasicShadowMap,
		shadowmapSize: 256,
		reflection: false,
		canUseSkyboxAsEnvironment: false
	},
	{
		pixelRatio: 1,
		allowedEffects: ['bloom'],
		useShadowmap: true,
		shadowmap: BasicShadowMap,
		shadowmapSize: 512,
		reflection: false,
		canUseSkyboxAsEnvironment: false
	},
	{
		pixelRatio: 1,
		allowedEffects: ['bloom', 'film'],
		useShadowmap: true,
		shadowmap: PCFSoftShadowMap,
		shadowmapSize: 1024,
		reflection: true,
		reflectionQuality: 0.5,
		reflectionMultisample: 0,
		canUseSkyboxAsEnvironment: false
	},
	{
		pixelRatio: 'device',
		allowedEffects: ['bloom', 'film'],
		useShadowmap: true,
		shadowmap: PCFSoftShadowMap,
		shadowmapSize: 1024,
		reflection: true,
		reflectionQuality: 1,
		reflectionMultisample: 2,
		canUseSkyboxAsEnvironment: true
	},
	{
		pixelRatio: 'device',
		allowedEffects: ['bloom', 'film'],
		useShadowmap: true,
		shadowmap: PCFSoftShadowMap,
		shadowmapSize: 2048,
		reflection: true,
		reflectionQuality: 1,
		reflectionMultisample: 4,
		canUseSkyboxAsEnvironment: true
	}
];

export type { quality };
export { qualities };
