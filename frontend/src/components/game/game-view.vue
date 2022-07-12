<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen, Dialog } from 'quasar';
import { onBeforeUnmount, onMounted, reactive, readonly, ref, Ref } from 'vue';
import { gameSocket } from 'src/boot/socketio';
import Scene, { mapConfig, options } from './canvas/scene';
import maps from './maps';

import type { state as commonState, Ping, Pong } from 'src/common/game/logic/common';

export interface interfaceState {
	error: string | null,
	connected: boolean,
	gamestate: boolean,
	loaded: boolean,
	accessibility: boolean,
	graphics: 0|1|2|3|4|5,
	can_join: boolean,
	spectator: boolean,
	paused: boolean,
	finish: boolean
}

const props = defineProps<{ party: string }>();

const state = reactive<interfaceState>({
	error: null,
	connected: false,
	gamestate: false,
	loaded: false,
	accessibility: false,
	graphics: 2,
	can_join: false,
	spectator: true,
	paused: true,
	finish: false
});

let scene: null | Scene = null;
const canvas = ref<Ref | null>(null);

const thetaTimes: number[] = [];
let thetaMean = 0;
let lastState: Partial<commonState> = {};

function animate ()
{
	scene?.render();
}

function resize ()
{
	scene?.setSize(canvas.value.offsetWidth, canvas.value.offsetHeight);
}

function quantile (arr: number[], q: number): number
{
	const sorted = arr.slice().sort((a, b) => (a - b));
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined)
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	else
		return sorted[base];
}

function refreshLatency ()
{
	scene?.setDateTheta(thetaMean);
	onState(lastState);
}

function onError (error: string)
{
	state.error = error;
}

function onPong ({ cdate, sdate }: Pong)
{
	const currentDate = new Date();
	const clientDate = new Date(cdate);
	const serverDate = new Date(sdate);
	const ping = (currentDate.getTime() - clientDate.getTime()) / 2;
	const theta = clientDate.getTime() - serverDate.getTime() - ping;

	thetaTimes.push(theta);
	if (thetaTimes.length > 15)
		thetaTimes.shift();

	if (thetaTimes.length > 12 || thetaTimes.length === 1)
	{
		const q25 = quantile(thetaTimes, 0.25);
		const q75 = quantile(thetaTimes, 0.75);
		const viableThetaTimes = thetaTimes.filter((value) => (value >= q25 && value <= q75));
		const viableThetaMean = viableThetaTimes.reduce((sum, itemValue) => (sum + itemValue), 0) / viableThetaTimes.length;
		thetaMean = Math.round(viableThetaMean * 100) / 100;
		refreshLatency();
	}
}

function onMapInfo (map: string)
{
	state.gamestate = true;
	if (!scene)
		mountScene((map in maps) ? maps[map] : maps.classic);
}

function onState (state: Partial<commonState>)
{
	let latency = 0;
	lastState = state;
	if ('date' in state)
	{
		const now: Date = new Date();
		const serverDate: Date = new Date(state.date);
		latency = (now.getTime() - (serverDate.getTime() + thetaMean));
	}
	scene?.setState(state, latency);
}

function onDisconnect ()
{
	state.connected = false;
	scene?.setState({
		lobby: true,
		text: 'Connection lost',
		textSize: 0.5,
		textColor: 0xff0000
	}, 0);
}

function onClick ()
{
	gameSocket.volatile.emit('party::click');
}

function onMove (value: number)
{
	gameSocket.volatile.emit(
		'party::move',
		{
			position: value
		}
	);
}

function mountScene (config: mapConfig)
{
	scene = new Scene(
		config,
		{
			targetElem: canvas.value,
			qualityLevel: state.graphics,
			width: canvas.value.offsetWidth,
			height: canvas.value.offsetHeight,
			onReady: () =>
			{
				state.loaded = true;
				(scene as Scene).setAnimationLoop(animate);
			}
		} as options
	);

	window.addEventListener('resize', resize);

	canvas.value.onclick = onClick;
	scene.setOnMove(onMove);
	scene.setOnStateChange(onStateChange);
}

function umountScene ()
{
	scene?.setAnimationLoop(null);
	window.removeEventListener('resize', resize);

	scene?.dispose();
	scene = null;
}

function refreshError ()
{
	state.error = null;
	state.gamestate = false;
	gameSocket.emit(
		'party::spectate',
		{
			room: props.party
		}
	);
}

function onConnected ()
{
	state.connected = true;
	gameSocket.emit(
		'party::spectate',
		{
			room: props.party
		}
	);

	for (let i = 1; i <= 20; i++)
	{
		setTimeout(
			function ()
			{
				gameSocket.volatile.emit('party::ping', { cdate: (new Date()).toISOString() } as Ping);
			},
			150 * i
		);
	}
}

function onStateChange (gameState: commonState)
{
	state.paused = gameState.paused;
	state.spectator = gameState.team === -1;
	state.can_join = state.spectator && gameState.lobby && (!gameState.avatars[0] || !gameState.avatars[1]);
	state.finish = gameState.finish;
}

onMounted(() =>
{
	gameSocket.on('party::error', onError);
	gameSocket.on('party::pong', onPong);
	gameSocket.on('party::mapinfo', onMapInfo);
	gameSocket.on('party::state', onState);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.on('connect', onConnected);

	if (gameSocket.connected)
		onConnected();
});

onBeforeUnmount(() =>
{
	gameSocket.off('party::error', onError);
	gameSocket.off('party::pong', onPong);
	gameSocket.off('party::mapinfo', onMapInfo);
	gameSocket.off('party::state', onState);
	gameSocket.off('disconnect', onDisconnect);
	gameSocket.off('connect', onConnected);
	gameSocket.emit('party::leaveAll');

	umountScene();
});

function join ()
{
	gameSocket.emit(
		'party::join',
		{
			room: props.party
		}
	);
}

function admitDefeat ()
{
	gameSocket.emit('party::pause');
	Dialog.create({
		title: 'Admit defeat ?',
		message: 'The score would be save if the first countdown were shown.',
		cancel: true
	})
		.onOk(
			() =>
			{
				gameSocket.emit('party::admitdefeat');
			}
		);
}

function toggleAccessibility ()
{
	scene?.setAccessibility(state.accessibility = !state.accessibility);
}

function setQuality (val: number)
{
	scene?.setQuality(val);
}

function getStateText ()
{
	if (!state.connected)
		return 'Connecting';
	if (!state.gamestate)
		return 'Awaiting gamestate';
	return 'Loading map';
}

defineExpose({
	onClick,
	join,
	admitDefeat,
	toggleAccessibility,
	setQuality,
	resize,
	state: readonly(state)
});
</script>

<template>
	<div
		:class="clsx('root', {
			'col': AppFullscreen.isActive,
			'windowed': !AppFullscreen.isActive
		})"
	>

		<canvas class="game-container" ref="canvas"></canvas>

		<div class="game-container full-width row justify-center content-center progress" v-if="!state.loaded">
			<div class="text-center" v-if="state.error">
				<p class="text-h2 text-negative">
					{{state.error}}
				</p>
				<q-btn
					color="primary"
					icon="refresh"
					label="Refresh"
					@click="refreshError"
				/>
			</div>
			<p class="text-h2" v-if="!state.error">
				{{getStateText()}}...
			</p>
			<q-linear-progress
				track-color="brown-3"
				color="green-9"
				class="self-center"
				rounded
				v-if="!state.error"
				:indeterminate="state.gamestate"
				:query="!state.connected || !state.gamestate"
			/>
		</div>

	</div>
</template>

<style scoped>
.root
{
	position: relative;
}
.windowed
{
	padding-bottom: 56.25%;
}
.game-container
{
	position: absolute;
	height: 100% !important;
	width: 100% !important;
}
.progress
{
	padding: 5em;
}
</style>
