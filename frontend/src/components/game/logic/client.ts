import {bounceBall} from './common.ts';


function playerMissBall(state)
{
	state.ballSpeedX = state.ballSpeedY = 0;
}

function clientLogic(state, config, delta)
{
	bounceBall(state, config, delta, playerMissBall, playerMissBall);
}

export default clientLogic;