import { Vector3, Euler, MeshPhongMaterial } from 'three';
import skyboxPX from '../../ressources/kloppenheim_02/px.png?url';
import skyboxNX from '../../ressources/kloppenheim_02/nx.png?url';
import skyboxPY from '../../ressources/kloppenheim_02/py.png?url';
import skyboxNY from '../../ressources/kloppenheim_02/ny.png?url';
import skyboxPZ from '../../ressources/kloppenheim_02/pz.png?url';
import skyboxNZ from '../../ressources/kloppenheim_02/nz.png?url';
import sceneFile from './scene.glb?url';
import font from 'three/examples/fonts/helvetiker_regular.typeface.json?url'; // https://threejs.org/docs/#examples/en/geometries/TextGeometry

import type { mapConfig, Material } from '../../logic/mapConfig';

const itemsMaterial: Material = new MeshPhongMaterial({
	color: 0xffffff,
	emissive: 0xffffff,
	emissiveIntensity: 0.5,
	specular: 0x777777
});

const ballMaterial = itemsMaterial.clone();

const config: mapConfig = {
	cameraClip: [1, 45],
	fov: 56,
	forceRotationRatio: 1.3,
	sceneFile,
	additionnalLight: ['1_Rouge_Orientation', '5_Bleu_Orientation'],
	skybox: [
		skyboxPX,
		skyboxNX,
		skyboxPY,
		skyboxNY,
		skyboxPZ,
		skyboxNZ
	],
	skyboxAsEnvironment: true,
	EnvironmentColor: 0x909090,
	lightDecayFactor: 0.5,
	lightIntensityFactor: 0.15,
	transitionSpeed: 2,
	playCameraPosition: new Vector3(0, 68.5, 11.5),
	playCameraRotation: new Euler(-Math.PI / 2 * 0.88, 0, 0),
	pauseCameraPosition: new Vector3(0, 57.15, 34.30),
	pauseCameraRotation: new Euler(-Math.PI / 2 * 0.7, 0, 0),
	floorMaterial: new MeshPhongMaterial({
		color: 0x00000,
		emissive: 0x00000,
		specular: 0x080808
	}),
	floorReflectivity: 0.15,
	floorReflectorColor: 0x777777,
	ballMaterial,
	offsideOpacityMultiplier: 5,
	player1Material: itemsMaterial,
	player2Material: itemsMaterial,
	gameScale: 0.175,
	baseSize: [65, 53],
	playerSize: [1, 3.75],
	moveSteps: 70,
	moveStatusRouding: true,
	scoreFont: font,
	scoreMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
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
	textMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.65,
		specular: 0x777777
	}),
	textPausePosition: new Vector3(0, 15, 10),
	textPauseRotation: new Euler(-Math.PI / 2 * 0.75, 0, 0),
	textPlayPosition: new Vector3(0, 8, 0),
	textPlayRotation: new Euler(-Math.PI / 2, 0, 0)
};

export default config;
