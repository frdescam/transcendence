import { MeshBasicMaterial } from 'three';
import headlessConfig from 'src/common/game/maps/classic.headless';
import font from 'three/examples/fonts/helvetiker_regular.typeface.json?url'; // https://threejs.org/docs/#examples/en/geometries/TextGeometry

import type { mapConfig, Material } from 'src/common/game/logic/mapConfig';

const itemsMaterial: Material = new MeshBasicMaterial({
	color: 0xffffff
});

const ballMaterial = itemsMaterial.clone();

const config: mapConfig = {
	...headlessConfig,
	floorMaterial: new MeshBasicMaterial({
		color: 0x202020
	}),
	ballMaterial,
	player1Material: itemsMaterial,
	player2Material: itemsMaterial,
	scoreFont: font,
	scoreMaterial: new MeshBasicMaterial({
		color: 0xaaaaaa
	}),
	textFont: font,
	textMaterial: new MeshBasicMaterial({
		color: 0xaaaaaa
	})
};

export default config;
