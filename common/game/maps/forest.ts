import { MeshPhongMaterial } from 'three';
import headlessConfig from './forest.headless';
import skyboxPX from '../../ressources/kloppenheim_02/px.png?url';
import skyboxNX from '../../ressources/kloppenheim_02/nx.png?url';
import skyboxPY from '../../ressources/kloppenheim_02/py.png?url';
import skyboxNY from '../../ressources/kloppenheim_02/ny.png?url';
import skyboxPZ from '../../ressources/kloppenheim_02/pz.png?url';
import skyboxNZ from '../../ressources/kloppenheim_02/nz.png?url';
import sceneFile from './forest.glb?url';
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
	...headlessConfig,
	sceneFile,
	skybox: [
		skyboxPX,
		skyboxNX,
		skyboxPY,
		skyboxNY,
		skyboxPZ,
		skyboxNZ
	],
	floorMaterial: new MeshPhongMaterial({
		color: 0x00000,
		emissive: 0x00000,
		specular: 0x080808
	}),
	ballMaterial,
	player1Material: itemsMaterial,
	player2Material: itemsMaterial,
	scoreFont: font,
	scoreMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.5,
		specular: 0x777777
	}),
	textFont: font,
	textMaterial: new MeshPhongMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.65,
		specular: 0x777777
	})
};

export default config;
