<script setup lang="ts">
import clsx from 'clsx';
import { io } from 'socket.io-client';
import { AppFullscreen } from 'quasar';
import { onBeforeUnmount, onMounted, reactive, readonly, ref, Ref } from 'vue';
import Scene, { mapConfig, options } from './canvas/scene';
import config from './common/maps/forest';

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
let socket: any = null;
const canvas = ref<Ref | null>(null);

function animate ()
{
	(scene as Scene).render();
}

function resize ()
{
	(scene as Scene).setSize(canvas.value.offsetWidth, canvas.value.offsetHeight);
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

	socket = io('http://localhost:3001');
	socket.on('connect', () =>
	{
		console.log('Connected', socket.id);

		socket.on('game::state', (state: Partial<commonState>) =>
		{
			scene?.setState(state, 0);
		});

		socket.on('disconnect', () =>
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
			socket.emit('game::click');
		};

		scene?.setOnMove((value: number) =>
		{
			socket.emit('game::move', value);
		});

		socket.emit('game::create', 't', 'forest');
	});
});

onBeforeUnmount(() =>
{
	(scene as Scene).setAnimationLoop(null);
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
