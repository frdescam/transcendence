import {Vector3, Euler, MeshPhongMaterial} from 'three';
import {mapConfig} from '../../canvas/scene';
import skybox_px from "../../ressources/kloppenheim_02/px.png?url";
import skybox_nx from "../../ressources/kloppenheim_02/nx.png?url";
import skybox_py from "../../ressources/kloppenheim_02/py.png?url";
import skybox_ny from "../../ressources/kloppenheim_02/ny.png?url";
import skybox_pz from "../../ressources/kloppenheim_02/pz.png?url";
import skybox_nz from "../../ressources/kloppenheim_02/nz.png?url";
import sceneFile from "./scene.glb?url";
import scoreFont from "three/examples/fonts/helvetiker_regular.typeface.json?url";  // https://threejs.org/docs/#examples/en/geometries/TextGeometry
import textFont from "three/examples/fonts/helvetiker_regular.typeface.json?url";  // https://threejs.org/docs/#examples/en/geometries/TextGeometry

const config: mapConfig = {
	sceneFile,
	skybox: [
		skybox_px,
		skybox_nx,
		skybox_py,
		skybox_ny,
		skybox_pz,
		skybox_nz,
	],
	skyboxAsEnvironment: true,
	EnvironmentColor: 0x707070,
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
	ballMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
	}),
	player1Material: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
	}),
	player2Material: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
	}),
	gameScale: 0.175,
	baseSize: [65, 53],
	playerSize: [1, 3.75],
	moveSteps: 70,
	moveStatusRouding: true,
	scoreFont,
	scoreMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
	}),
	scorePositions: [
		new Vector3(-(32.5 - 8), 4, -(53 / 2 + 4)),
		new Vector3((32.5 - 8), 4, -(53 / 2 + 4)),
	],
	scoreRotations: [
		new Euler(-Math.PI / 2 * 0.85, 0, 0),
		new Euler(-Math.PI / 2 * 0.85, 0, 0)
	],
	avatarPositions: [
		new Vector3(-36.5, 4, 0),
		new Vector3(36.5, 4, 0),
	],
	textFont,
	textMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
	}),
	textPausePosition: new Vector3(0, 15, 10),
	textPauseRotation: new Euler(-Math.PI / 2 * 0.75, 0, 0),
	textPlayPosition: new Vector3(0, 8, 0),
	textPlayRotation: new Euler(-Math.PI / 2, 0, 0),
};

export default config;