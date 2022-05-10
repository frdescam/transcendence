import {bounceBall} from './common';


function start(state)
{
	setTimeout(function()
	{
		state.ballX = 0.5;
		state.bally = 0;
		state.ballSpeedX = -0.3;
		state.ballSpeedY = -0.3;
		state.pause = false;
	}, 3000);
}

function serverLogic(state, config, delta)
{
	bounceBall(state, config, delta,
		(state) => {
			state.scores[1] += 1;
			state.pause = true;
			start(state);
		},
		(state) => {
			state.scores[0] += 1;
			state.pause = true;
			start(state);
		}
	);
}

export default serverLogic;