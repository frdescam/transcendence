import type { Color } from 'three';
import type { mapConfig } from './mapConfig';

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
	offside: boolean,
	paused: boolean,
	text: string,
	textSize: number,
	textColor: Color | number,
	avatars: [avatar, avatar],
};

type missedCallback = (state: state, remainingDelta: number) => void;

function didPlayerMissBall ({ ballY, players }: state, { baseSize, playerSize }: mapConfig, player: team)
{
	const eqPlayerPos = (players[player] - 0.5) * ((baseSize[1] - playerSize[1]) / (baseSize[1] - 1)) + 0.5;

	return (
		ballY * baseSize[1] + 0.5 < eqPlayerPos * baseSize[1] - playerSize[1] * 0.5 ||
		ballY * baseSize[1] - 0.5 > eqPlayerPos * baseSize[1] + playerSize[1] * 0.5
	);
}

function getBounceAngle ({ ballY, players }: state, { baseSize, playerSize }: mapConfig, player: team)
{
	const eqPlayerPos = (players[player] - 0.5) * ((baseSize[1] - playerSize[1]) / (baseSize[1] - 1)) + 0.5;

	return ((eqPlayerPos - ballY) * baseSize[1] / ((playerSize[1] + 1) / 2)) / 2;
}

function wayBackToLimit (state: state)
{
	let remaining = 0;

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

function getSpeed ({ ballSpeedX, ballSpeedY }: state)
{
	return (Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2));
}

function forward (state: state, delta: number)
{
	state.ballX += (delta * state.ballSpeedX);
	state.ballY += (delta * state.ballSpeedY);
}

function bounceBall (state: state, config: mapConfig, delta: number, player1Miss: missedCallback, player2Miss: missedCallback)
{
	if (state.ballSpeedX || state.ballSpeedY)
	{
		forward(state, delta);

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
			const missed = didPlayerMissBall(state, config, 0);

			if (missed)
			{
				state.offside = true;
				player1Miss(state, remainingDelta);
			}
			else
			{
				const bounceAngle = getBounceAngle(state, config, 0);
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
			const missed = didPlayerMissBall(state, config, 1);

			if (missed)
			{
				state.offside = true;
				player2Miss(state, remainingDelta);
			}
			else
			{
				const bounceAngle = getBounceAngle(state, config, 1);
				const speed = getSpeed(state);
				state.ballSpeedY = -Math.sin(bounceAngle * Math.PI / 2) * speed;
				state.ballSpeedX = -Math.cos(bounceAngle * Math.PI / 2) * speed;
				state.ballX += (remainingDelta * state.ballSpeedX);
				state.ballY += (remainingDelta * state.ballSpeedY);
			}
		}
	}
}

export type { team, avatar, state, missedCallback };
export { bounceBall, forward };
