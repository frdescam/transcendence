<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen, Dialog, Notify } from 'quasar';
import { onBeforeUnmount, onMounted, onUnmounted, reactive, readonly, ref, Ref, inject } from 'vue';
import { Socket } from 'socket.io-client';
import { Capitalize } from 'src/boot/libs';
import Scene, { mapConfig, options } from './canvas/scene';
import maps from './maps';

import type { state as commonState, Ping, Pong } from 'src/common/game/interfaces';
import type { controlsMode } from 'src/common/game/types';

type qualityLevels = 0|1|2|3|4|5;

export interface interfaceState {
	error: string | null,
	connected: boolean,
	gamestate: boolean,
	loaded: boolean,
	accessibility: boolean,
	graphics: qualityLevels,
	can_join: boolean,
	spectator: boolean,
	paused: boolean,
	lobby: boolean,
	finish: boolean,
	available_controls: {
		wheel: boolean,
		keyboard: boolean,
		mouse: boolean
	},
	controls: {
		wheel: boolean,
		keyboard: boolean,
		mouse: boolean
	}
}

const capitalize: Capitalize = inject('capitalize') as Capitalize;
const gameSocket: Socket = inject('socketGame') as Socket;

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
	lobby: true,
	finish: false,
	available_controls: {
		wheel: true,
		keyboard: true,
		mouse: true
	},
	controls: {
		wheel: true,
		keyboard: true,
		mouse: true
	}
});

let scene: null | Scene = null;
const canvas = ref<Ref | null>(null);

const thetaTimes: number[] = [];
let thetaMean = 0;
let lastState: Partial<commonState> = {};

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
	if (state.gamestate)
	{
		Notify.create({
			position: 'top',
			progress: true,
			timeout: 15000,
			message: error,
			type: 'negative',
			multiLine: true,
			actions: [
				{
					label: 'Dismiss',
					color: 'white'
				}
			]
		});
	}
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

	if (thetaTimes.length > 16 || thetaTimes.length === 1)
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
	const usedMap = (map in maps) ? maps[map] : maps.classic;
	if (!scene)
	{
		mountScene(usedMap);
		state.available_controls = {
			wheel: usedMap.controls.includes('wheel'),
			keyboard: usedMap.controls.includes('keyboard'),
			mouse: usedMap.controls.includes('mouse')
		};
		state.controls = {
			wheel: state.available_controls.wheel && state.controls.wheel,
			keyboard: state.available_controls.keyboard && state.controls.keyboard,
			mouse: state.available_controls.mouse && state.controls.mouse
		};
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
				scene?.setAccessibility(state.accessibility);
				scene?.setQuality(state.graphics);
				for (const control in ['wheel', 'keyboard', 'mouse'])
				{
					if (state.available_controls[control])
						scene?.setControl(control, state.controls[control]);
				}
			},
			onError
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
		},
		(err) =>
		{
			state.error = err.message ? err.message : err;
		}
	);

	for (let i = 1; i <= 40; i++)
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
	state.lobby = gameState.lobby;
	state.spectator = gameState.team === -1;
	state.can_join = state.spectator && gameState.lobby && (!gameState.avatars[0] || !gameState.avatars[1]) && gameState.could_join;
	state.finish = gameState.finish;
}

onMounted(() =>
{
	gameSocket.connect();
	gameSocket.on('party::error', onError);
	gameSocket.on('party::pong', onPong);
	gameSocket.on('party::mapinfo', onMapInfo);
	gameSocket.on('party::state', onState);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.on('connect', onConnected);

	if (gameSocket.connected)
		onConnected();
});

onUnmounted(() => gameSocket.disconnect());

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

gameSocket.on('disconnect', (reason: Socket.DisconnectReason) =>
{
	if (reason === 'io server disconnect')
		gameSocket.connect();
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
	state.accessibility = !state.accessibility;
	scene?.setAccessibility(state.accessibility);
}

function setQuality (val: qualityLevels)
{
	scene?.setQuality(val);
	state.graphics = val;
}

function toggleControl (control: controlsMode)
{
	if (control in state.available_controls && state.available_controls[control])
	{
		state.controls[control] = !state.controls[control];
		scene?.setControl(control, state.controls[control]);
	}
}

defineExpose({
	onClick,
	join,
	admitDefeat,
	toggleAccessibility,
	setQuality,
	toggleControl,
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
				<p :class="clsx($q.screen.lt.sm ? 'text-h4' : 'text-h2', 'text-negative')">
					{{state.error}}
				</p>
				<q-btn
					:dense="$q.screen.lt.sm"
					color="primary"
					icon="refresh"
					:label="capitalize($t('game.gameView.refresh'))"
					@click="refreshError"
				/>
			</div>
			<p class="text-h2" v-if="!state.error">
				<template v-if="!state.connected">
					{{ capitalize($t('game.gameView.state.connected')) }}
				</template>
				<template v-else-if="!state.gamestate">
					{{ capitalize($t('game.gameView.state.state')) }}
				</template>
				<template v-else>
					{{ capitalize($t('game.gameView.state.default')) }}
				</template>
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
