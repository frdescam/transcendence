import forest from './forest.headless';
import classic from './classic.headless';

import type { mapConfig } from '../logic/mapConfig';

const maps = {
    forest: forest as mapConfig,
    classic: classic as mapConfig
};

export default maps;