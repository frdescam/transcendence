import { Vector3, Euler } from 'three';

import type { mapConfig } from '../interfaces';

const config: Partial<mapConfig> = {
	name: 'The Magical Forest',
	cameraClip: [1, 45],
	fov: 56,
	forceRotationRatio: 1.3,
	effects: [],
	controls: ['wheel', 'keyboard', 'mouse'],
	speedFactor: 0.6,
	additionnalLight: ['1_Rouge_Orientation', '5_Bleu_Orientation'],
	skyboxAsEnvironment: true,
	EnvironmentColor: 0x909090,
	lightDecayFactor: 0.5,
	lightIntensityFactor: 0.15,
	hasShadow: true,
	transitionSpeed: 2,
	playCameraPosition: new Vector3(0, 68.5, 11.5),
	playCameraRotation: new Euler(-Math.PI / 2 * 0.88, 0, 0),
	pauseCameraPosition: new Vector3(0, 57.15, 34.30),
	pauseCameraRotation: new Euler(-Math.PI / 2 * 0.7, 0, 0),
	floorReflectivity: 0.15,
	floorReflectorColor: 0x777777,
	offsideOpacityMultiplier: 5,
	gameScale: 0.175,
	baseSize: [65, 53],
	playerSize: [1, 3.75],
	moveSteps: 60,
	scoreFontHeight: 1,
	scorePositions: [
		new Vector3(-(32.5 - 8), 4, -(53 / 2 + 4)),
		new Vector3((32.5 - 8), 4, -(53 / 2 + 4))
	],
	scoreRotations: [
		new Euler(-Math.PI / 2 * 0.85, 0, 0),
		new Euler(-Math.PI / 2 * 0.85, 0, 0)
	],
	avatarPositions: [
		new Vector3(-42, 4, 0),
		new Vector3(42, 4, 0)
	],
	avatarScale: 1.25,
	textFontHeight: 1,
	textPausePosition: new Vector3(0, 15, 10),
	textPauseRotation: new Euler(-Math.PI / 2 * 0.75, 0, 0),
	textPlayPosition: new Vector3(0, 8, 0),
	textPlayRotation: new Euler(-Math.PI / 2, 0, 0)
};

export default config;
