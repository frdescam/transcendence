import { Color } from "three";

type team = 0 | 1;
type avatar = string | null;

type state = {
	team: team,
	players: [number, number],
	scores: [number, number],
	ballX: number,
	ballY: number,
	ballSpeedX: number,
	ballSpeedY: number,
	paused: boolean,
	text: string,
	textSize: number,
	textColor: Color | number,
	avatars: [avatar, avatar],
};


function didPlayerMissBall({ballY, players}, {baseSize, playerSize}, player: team)
{
	const eqPlayerPos = (players[player] - 0.5) * ((baseSize[1] - playerSize[1]) / (baseSize[1] - 1)) + 0.5;

	return (
		ballY * baseSize[1] + 0.5 < eqPlayerPos * baseSize[1] - playerSize[1] * 0.5 ||
		ballY * baseSize[1] - 0.5 > eqPlayerPos * baseSize[1] + playerSize[1] * 0.5
	)
}

function getBounceAngle({ballY, players}, {baseSize, playerSize}, player)
{
	const eqPlayerPos = (players[player] - 0.5) * ((baseSize[1] - playerSize[1]) / (baseSize[1] - 1)) + 0.5;

	return ((eqPlayerPos - ballY) * baseSize[1] / ((playerSize[1] + 1) / 2)) / 2;
}

function round(f)
{
	return Math.round(f * 10000000000) / 10000000000;
}

function wayBackToLimit(state: state)
{
	var remaining	= 0;

	if (state.ballX < 0)
	{
		remaining = state.ballX / state.ballSpeedX;
		state.ballY -= (state.ballSpeedY * remaining);
		state.ballX = 0;
	}
	else if (state.ballX > 1)
	{
		remaining = (state.ballX - 1) / state.ballSpeedX;
		state.ballY -= (state.ballSpeedY * remaining);
		state.ballX = 1;
	}

	return (remaining);
}

function getSpeed({ballSpeedX, ballSpeedY})
{
	return (Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2));
}

function bounceBall(state, config, delta, player1Miss, player2Miss)
{
	if (state.ballSpeedX || state.ballSpeedY)
	{
		state.ballX += (delta * state.ballSpeedX);
		state.ballY += (delta * state.ballSpeedY);
		
		if (state.ballY < 0)
		{
			state.ballSpeedY *= -1;
			state.ballY *= -1;
		}
		else if (state.ballY > 1)
		{
			state.ballSpeedY *= -1;
			state.ballY = state.ballY - (state.ballY - 1) * 2;
		}
		
		if (state.ballX < 0)
		{
			const remainingDelta = wayBackToLimit(state);
			const bounceAngle = getBounceAngle(state, config, 0);

			if (Math.abs(bounceAngle) > 1)
			{
				player1Miss(state);
			}
			else
			{
				const speed = getSpeed(state);
				state.ballSpeedY = -Math.sin(bounceAngle * Math.PI / 2) * speed;
				state.ballSpeedX = Math.cos(bounceAngle * Math.PI / 2) * speed;
				state.ballX += (remainingDelta * state.ballSpeedX);
				state.ballY += (remainingDelta * state.ballSpeedY);
			}
		}
		else if (state.ballX > 1)
		{
			const remainingDelta = wayBackToLimit(state);
			const bounceAngle = getBounceAngle(state, config, 1);
			
			if (Math.abs(bounceAngle) > 1)
			{
				player2Miss(state);
			}
			else
			{
				const speed = getSpeed(state);
				state.ballSpeedY = -Math.sin(bounceAngle * Math.PI / 2) * speed;
				state.ballSpeedX = -Math.cos(bounceAngle * Math.PI / 2) * speed;
				state.ballX += (remainingDelta * state.ballSpeedX);
				state.ballY += (remainingDelta * state.ballSpeedY);
			}
		}
	}
}

export {team, avatar, state, bounceBall, getBounceAngle};