import classic from './classic';
import forest from './forest';
import synthwave from './synthwave';

import type { mapConfig } from 'src/common/game/interfaces';
import type { mapsObject } from 'src/common/game/maps';

const maps: mapsObject = {
	classic: classic as mapConfig,
	forest: forest as mapConfig,
	synthwave: synthwave as mapConfig
};

export default maps;
