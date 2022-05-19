import {bounceBall, forward} from './common.ts';


function playerMissBall(state, remainingDelta)
{
	forward(state, remainingDelta);
}

function clientLogic(state, config, delta)
{
	if (state.offside)
		forward(state, delta);
	else
		bounceBall(state, config, delta, playerMissBall, playerMissBall);
}

export default clientLogic;