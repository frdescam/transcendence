<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen } from 'quasar';
import { onBeforeUnmount, onMounted, reactive, readonly, ref, Ref } from 'vue';
import { gameSocket } from 'src/boot/socketio';
import Scene, { mapConfig, options } from './canvas/scene';
import config from './maps/forest';

import type { state as commonState } from './common/logic/common';

interface interfaceState {
	loaded: boolean,
	ready: boolean,
	paused: boolean,
	graphics: 0|1|2|3|4|5
}

defineProps<{ userId: string, party: string }>();

const state = reactive<interfaceState>({ loaded: false, ready: false, paused: true, graphics: 2 });

let scene: null | Scene = null;
const canvas = ref<Ref | null>(null);

function animate ()
{
	(scene as Scene).render();
}

function resize ()
{
	(scene as Scene).setSize(canvas.value.offsetWidth, canvas.value.offsetHeight);
}

function onSocketConnected ()
{
	gameSocket.on('party::state', (state: Partial<commonState>) =>
	{
		// @TODO: Take ping in account, and pass ping/2
		scene?.setState(state, 0);
	});

	gameSocket.on('disconnect', () =>
	{
		scene?.setState({
			lobby: true,
			text: 'Connection lost',
			textSize: 0.5,
			textColor: 0xff0000
		}, 0);
	});

	canvas.value.onclick = () =>
	{
		gameSocket.emit('party::click');
	};

	scene?.setOnMove((value: number) =>
	{
		gameSocket.emit(
			'party::move',
			{
				position: value
			}
		);
	});

	// Should be 'join' event, as create will be done on a dedicated page. That's for dev only.
	gameSocket.emit(
		'party::create',
		{
			room: 't',
			map: 'forest'
		}
	);
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
		} as options,
		0
	);

	window.addEventListener('resize', resize);

	gameSocket.on('connect', onSocketConnected);
});

onBeforeUnmount(() =>
{
	gameSocket.off('connect', onSocketConnected);
	gameSocket.emit('party::leaveAll');
	scene?.setAnimationLoop(null);
	window.removeEventListener('resize', resize);

	scene?.dispose();
	scene = null;
});

function togglePause ()
{
	state.paused = !state.paused;
}

function setQuality (val: number)
{
	scene?.setQuality(val);
}

defineExpose({
	togglePause,
	setQuality,
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
