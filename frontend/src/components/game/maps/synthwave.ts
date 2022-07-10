import { MeshPhongMaterial, MeshLambertMaterial } from 'three';
import headlessConfig from 'src/common/game/maps/synthwave.headless';
import sceneFile from './synthwave.glb?url';
import scoreFont from 'three/examples/fonts/droid/droid_sans_bold.typeface.json?url'; // https://threejs.org/docs/#examples/en/geometries/TextGeometry
import textFont from '../ressources/text_me_one/Text Me One_Regular.json?url'; // https://threejs.org/docs/#examples/en/geometries/TextGeometry

import type { mapConfig, Material } from 'src/common/game/logic/mapConfig';

const itemsMaterial: Material = new MeshLambertMaterial({
	color: 0xffffff,
	emissive: 0xffffff,
	emissiveIntensity: 1
});

const ballMaterial = new MeshLambertMaterial({
	color: 0xd150fc,
	emissive: 0xd150fc,
	emissiveIntensity: 1
});

const config: mapConfig = {
	...headlessConfig,
	sceneFile,
	floorMaterial: new MeshPhongMaterial({
		color: 0x00000,
		emissive: 0x00000,
		specular: 0x080808
	}),
	ballMaterial,
	player1Material: itemsMaterial,
	player2Material: itemsMaterial,
	scoreFont: scoreFont,
	scoreMaterial: new MeshLambertMaterial({
		color: 0x44fc50,
		emissive: 0x44fc50,
		emissiveIntensity: 0.8
	}),
	textFont: textFont,
	textMaterial: new MeshLambertMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 1.5
	})
};

export default config;
