import classic from './classic';
import forest from './forest';
import synthwave from './synthwave';

import type { mapConfig } from '../logic/mapConfig';

const maps = {
    classic: classic as mapConfig,
    forest: forest as mapConfig,
    synthwave: synthwave as mapConfig
};

export default maps;
