import { MeshBasicMaterial } from 'three';
import headlessConfig from 'src/common/game/maps/classic.headless';
import font from 'three/examples/fonts/helvetiker_regular.typeface.json?url'; // https://threejs.org/docs/#examples/en/geometries/TextGeometry

import type { mapConfig } from 'src/common/game/interfaces';
import type { Material } from 'src/common/game/types';

const itemsMaterial: Material = new MeshBasicMaterial({
	color: 0xffffff
});

const ballMaterial = itemsMaterial.clone();

const config: mapConfig = {
	...headlessConfig,
	floorMaterial: new MeshBasicMaterial({
		color: 0x1c1c1c
	}),
	ballMaterial,
	dash: 31,
	dashMaterial: itemsMaterial,
	player1Material: itemsMaterial,
	player2Material: itemsMaterial,
	scoreFont: font,
	scoreMaterial: new MeshBasicMaterial({
		color: 0xffffff
	}),
	textFont: font,
	textMaterial: new MeshBasicMaterial({
		color: 0xffffff
	})
} as mapConfig;

export default config;
