import forest from './forest';
import classic from './classic';

import type { mapConfig } from '../logic/mapConfig';

const maps = {
    forest: forest as mapConfig,
    classic: classic as mapConfig
};

export default maps;