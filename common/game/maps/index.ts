import classic from './classic.headless';
import forest from './forest.headless';
import synthwave from './synthwave.headless';

import type { mapConfig } from '../interfaces';

const maps = {
    classic: classic as mapConfig,
    forest: forest as mapConfig,
    synthwave: synthwave as mapConfig
};

export default maps;
