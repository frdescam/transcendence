import type { Euler, Color, Vector3 } from 'three';
import type { Material, avatar, inclusiveTeam, userId, controlsMode } from './types';

interface mapConfig {
	name: string,
	cameraClip: [number, number],
	fov: number,
	forceRotationRatio: number,
	effects: string[],
	controls: controlsMode[],
  speedFactor: number,
	sceneFile?: string,
	additionnalLight?: string[],
	skybox?: [
		skybox_px: string,
		skybox_nx: string,
		skybox_py: string,
		skybox_ny: string,
		skybox_pz: string,
		skybox_nz: string,
	],
	skyboxAsEnvironment: boolean,
	EnvironmentColor: Color | number,
	lightDecayFactor: number,
	lightIntensityFactor: number,
	hasShadow: boolean,
	transitionSpeed: number,
	playCameraPosition: Vector3,
	playCameraRotation: Euler,
	pauseCameraPosition: Vector3,
	pauseCameraRotation: Euler,
	player1Material: Material,
	player2Material: Material,
	floorMaterial: Material,
	floorReflectivity: number,
	floorReflectorColor: Color | number,
	ballMaterial: Material,
	dash: number | false,
	dashHeight?: number,
	dashMaterial?: Material,
	offsideOpacityMultiplier: number,
	gameScale: number,
	baseSize: [number, number],
	playerSize: [number, number],
	moveSteps: number,
	scoreFont: string,
	scoreFontHeight: number,
	scoreMaterial: Material,
	scorePositions: [Vector3, Vector3],
	scoreRotations: [Euler, Euler],
	avatarPositions: [Vector3, Vector3],
	avatarScale: number,
	textFont: string,
	textFontHeight: number,
	textMaterial: Material,
	textPausePosition: Vector3,
	textPauseRotation: Euler,
	textPlayPosition: Vector3,
	textPlayRotation: Euler,
}

interface serverState {
	date: Date | string,
	positions: [number, number],
	scores: [number, number],
	ball: boolean,
	ballX: number,
	ballY: number,
	ballSpeedX: number,
	ballSpeedY: number,
	offside: boolean,
	lobby: boolean,
	paused: boolean,
	frozen: boolean,
	text: string,
	textSize: number,
	textColor: Color | number,
	avatars: [avatar, avatar],
	presences: [boolean, boolean],
	readyStates: [boolean, boolean],
	finish: boolean
}

interface state extends serverState {
	team: inclusiveTeam,
	spectator: boolean,
	can_join: boolean,
	could_join: boolean
}

interface partyQuery {
	map?: string,
  adversary?: userId,
  requester: userId
}

interface Ping {
	cdate: string
}

interface Pong extends Ping{
	sdate: string
}

export type { mapConfig, serverState, state, partyQuery, Ping, Pong };
