import { Vector3, Euler } from 'three';

import type { mapConfig } from '../interfaces';

const config: Partial<mapConfig> = {
	cameraClip: [1, 400],
	fov: 56,
	forceRotationRatio: 1.3,
	effects: ['bloom', 'film'],
	controls: ['keyboard', 'mouse'],
	additionnalLight: [],
	skyboxAsEnvironment: false,
	EnvironmentColor: 0x000000,
	lightDecayFactor: 0.5,
	lightIntensityFactor: 0.22,
	hasShadow: false,
	transitionSpeed: 1.65,
	playCameraPosition: new Vector3(0, 68.5, 11.5),
	playCameraRotation: new Euler(-Math.PI / 2 * 0.88, 0, 0),
	pauseCameraPosition: new Vector3(0, 40, 100),
	pauseCameraRotation: new Euler(-Math.PI / 2 * 0.15, 0, 0),
	floorReflectivity: 0.15,
	floorReflectorColor: 0x777777,
	offsideOpacityMultiplier: 5,
	gameScale: 0.05,
	baseSize: [65, 53],
	playerSize: [1, 3.75],
	moveSteps: 60,
	scoreFontHeight: 0.7,
	scorePositions: [
		new Vector3(-(32.5 - 23), 4, -(53 / 2 + 4)),
		new Vector3((32.5 - 23), 4, -(53 / 2 + 4))
	],
	scoreRotations: [
		new Euler(-Math.PI / 2 * 0.75, 0, 0),
		new Euler(-Math.PI / 2 * 0.75, 0, 0)
	],
	avatarPositions: [
		new Vector3(-24, 8, -(53 / 2 + 1)),
		new Vector3(24, 8, -(53 / 2 + 1))
	],
	avatarScale: 2,
	textFontHeight: 0.8,
	textPausePosition: new Vector3(0, 4, 50),
	textPauseRotation: new Euler(-Math.PI / 2 * 0.2, 0, 0),
	textPlayPosition: new Vector3(0, 8, 18),
	textPlayRotation: new Euler(-Math.PI / 2, 0, 0)
};

export default config;
