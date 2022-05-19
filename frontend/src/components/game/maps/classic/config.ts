import { Vector3, Euler, MeshBasicMaterial } from 'three';
import font from 'three/examples/fonts/helvetiker_regular.typeface.json?url'; // https://threejs.org/docs/#examples/en/geometries/TextGeometry

import type { mapConfig, Material } from '../../logic/mapConfig';

const itemsMaterial: Material = new MeshBasicMaterial({
	color: 0xffffff
});

const ballMaterial = itemsMaterial.clone();

const config: mapConfig = {
	cameraClip: [1, 45],
	fov: 56,
	forceRotationRatio: 1.3,
	skyboxAsEnvironment: false,
	EnvironmentColor: 0xffffff,
	lightDecayFactor: 0.5,
	lightIntensityFactor: 0.15,
	transitionSpeed: 2,
	playCameraPosition: new Vector3(0, 68.5, 11.5),
	playCameraRotation: new Euler(-Math.PI / 2 * 0.88, 0, 0),
	pauseCameraPosition: new Vector3(0, 57.15, 34.30),
	pauseCameraRotation: new Euler(-Math.PI / 2 * 0.7, 0, 0),
	floorMaterial: new MeshBasicMaterial({
		color: 0x121212
	}),
	floorReflectivity: 0.15,
	floorReflectorColor: 0x777777,
	ballMaterial,
	offsideOpacityMultiplier: 3,
	player1Material: itemsMaterial,
	player2Material: itemsMaterial,
	gameScale: 0.175,
	baseSize: [65, 53],
	playerSize: [1, 3.75],
	moveSteps: 70,
	moveStatusRouding: true,
	scoreFont: font,
	scoreMaterial: new MeshBasicMaterial({
		color: 0xaaaaaa
	}),
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
	textFont: font,
	textMaterial: new MeshBasicMaterial({
		color: 0xffffff
	}),
	textPausePosition: new Vector3(0, 15, 10),
	textPauseRotation: new Euler(-Math.PI / 2 * 0.75, 0, 0),
	textPlayPosition: new Vector3(0, 8, 0),
	textPlayRotation: new Euler(-Math.PI / 2, 0, 0)
};

export default config;
