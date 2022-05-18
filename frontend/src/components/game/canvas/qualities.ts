import { BasicShadowMap, PCFSoftShadowMap, ShadowMapType } from "three";

type quality = {
	pixelRatio: number | 'device';
	critical?: boolean,
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
		canUseSkyboxAsEnvironment: false,
	},
	{
		pixelRatio: 0.75,
		useShadowmap: true,
		shadowmap: BasicShadowMap,
		shadowmapSize: 256,
		reflection: false,
		canUseSkyboxAsEnvironment: false
	},
	{
		pixelRatio: 1,
		useShadowmap: true,
		shadowmap: BasicShadowMap,
		shadowmapSize: 512,
		reflection: false,
		canUseSkyboxAsEnvironment: false
	},
	{
		pixelRatio: 1,
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
		useShadowmap: true,
		shadowmap: PCFSoftShadowMap,
		shadowmapSize: 2048,
		reflection: true,
		reflectionQuality: 1,
		reflectionMultisample: 2,
		canUseSkyboxAsEnvironment: true
	}
];

export {qualities, quality};