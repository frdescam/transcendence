<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen, Dialog } from 'quasar';
import { onBeforeUnmount, onMounted, reactive, readonly, ref, Ref } from 'vue';
import { gameSocket } from 'src/boot/socketio';
import Scene, { mapConfig, options } from './canvas/scene';
import config from './maps/synthwave';

import type { state as commonState, Ping, Pong } from 'src/common/game/logic/common';

export interface interfaceState {
	loaded: boolean,
	graphics: 0|1|2|3|4|5,
	can_join: boolean,
	spectator: boolean,
	paused: boolean,
	finish: boolean
}

const props = defineProps<{ party: string }>();

const state = reactive<interfaceState>({ loaded: false, graphics: 2, can_join: false, spectator: true, paused: true, finish: false });

let scene: null | Scene = null;
const canvas = ref<Ref | null>(null);

const thetaTimes: number[] = [];
let thetaMean = 0;
let lastState: Partial<commonState> = {};

function animate ()
{
	(scene as Scene).render();
}

function resize ()
{
	(scene as Scene).setSize(canvas.value.offsetWidth, canvas.value.offsetHeight);
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
	onState(lastState);
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

	if (thetaTimes.length > 8)
	{
		const q25 = quantile(thetaTimes, 0.25);
		const q75 = quantile(thetaTimes, 0.75);
		const viableThetaTimes = thetaTimes.filter((value) => (value >= q25 && value <= q75));
		const viableThetaMean = viableThetaTimes.reduce((sum, itemValue) => (sum + itemValue), 0) / viableThetaTimes.length;
		thetaMean = Math.round(viableThetaMean * 100) / 100;
		refreshLatency();
	}
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

function onConnected ()
{
	// Should be 'join' event, as create will be done on a dedicated page. That's for dev only.
	gameSocket.emit(
		'party::create',
		{
			room: props.party,
			map: 'synthwave'
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
	scene = new Scene(
		config as mapConfig,
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

	gameSocket.on('party::pong', onPong);
	gameSocket.on('party::state', onState);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.on('connect', onConnected);

	if (gameSocket.connected)
		onConnected();
});

onBeforeUnmount(() =>
{
	gameSocket.off('party::pong', onPong);
	gameSocket.off('party::state', onState);
	gameSocket.off('disconnect', onDisconnect);
	gameSocket.off('connect', onConnected);
	gameSocket.emit('party::leaveAll');
	scene?.setAnimationLoop(null);
	window.removeEventListener('resize', resize);

	scene?.dispose();
	scene = null;
});

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

function setQuality (val: number)
{
	scene?.setQuality(val);
}

defineExpose({
	onClick,
	admitDefeat,
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
			<q-linear-progress indeterminate rounded track-color="brown-3" color="green-9" class="self-center"/>
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
