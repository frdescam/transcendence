import { bounceBall, forward } from 'src/common/game/logic';

import type { mapConfig, state } from 'src/common/game/interfaces';
import type { missedCallback } from 'src/common/game/types';

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
