import { bounceBall, forward } from 'src/common/game/logic/common';

import type { missedCallback, state } from 'src/common/game/logic/common';
import type { mapConfig } from 'src/common/game/logic/mapConfig';

const playerMissBall: missedCallback = (state, remainingDelta) =>
{
	forward(state, remainingDelta);
};

function clientLogic (state: state, config: mapConfig, delta: number)
{
	if (state.offside)
		forward(state, delta);
	else
		bounceBall(state, config, delta, playerMissBall, playerMissBall);
}

export default clientLogic;
