'use strict';
import {Euler, Mesh, AmbientLight, Clock, LoadingManager, CubeTextureLoader, TextureLoader, Scene, PerspectiveCamera, WebGLRenderer, LinearEncoding, ACESFilmicToneMapping, SpriteMaterial, Sprite, Color, Vector3, Material, Texture, MeshBasicMaterial, MeshToonMaterial, MeshDepthMaterial, MeshPhongMaterial, MeshDistanceMaterial, MeshLambertMaterial, MeshMatcapMaterial, MeshNormalMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PlaneBufferGeometry, BoxBufferGeometry, sRGBEncoding, ShadowMapType} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import {quality, qualities} from './qualities';
import clientLogic from '../logic/client';
import {state, team} from '../logic/common';

type mapConfig = {
	cameraClip: [number, number],
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
	gameScale: number,
	baseSize: [number, number],
	playerSize: [number, number],
	moveSteps: number,
	moveStatusRouding: boolean,
	scoreFont: string,
	scoreMaterial: Material,
	scorePositions: [Vector3, Vector3],
	scoreRotations: [Euler, Euler],
	avatarPositions: [Vector3, Vector3],
	avatarScale: number,
	textFont: string,
	textMaterial: MeshPhongMaterial | MeshBasicMaterial | MeshToonMaterial | MeshLambertMaterial | MeshMatcapMaterial | MeshPhysicalMaterial | MeshStandardMaterial,
	textPausePosition: Vector3,
	textPauseRotation: Euler,
	textPlayPosition: Vector3,
	textPlayRotation: Euler,
}

type options = {
	qualityLevel: number,
	width: number,
	height: number,
	targetElem: HTMLElement,
	onReady: () => void,
	onProgress: (itemUrl: string, itemsLoaded: number, itemsTotal: number) => void,
	onError: (itemUrl: string) => void,
	onMove: (position: number) => void,
};

class PongScene
{
	protected config: mapConfig;
	protected options: options;
	protected state: state;
	protected disposed: boolean;
	protected clock: Clock;
	protected scrollMovementCallback: null | ((e: WheelEvent) => void);
	
	protected playerMoveDistance: number;
	protected ballMoveDistanceX: number;
	protected ballMoveDistanceY: number;
	protected moveDelta: number;

	protected loadingManager: LoadingManager;
	protected gltfLoader: GLTFLoader;
	protected fontLoader: FontLoader;
	protected skyboxLoader: CubeTextureLoader;

	protected disposable: any[];
	protected scene: Scene;
	protected envTexture: Texture;
	protected renderer: WebGLRenderer;
	protected camera: PerspectiveCamera;
	protected floorMirror: Reflector | null;
	protected floor: Mesh;
	protected envLight: AmbientLight | null;
	protected ball: Mesh;
	protected player1: Mesh;
	protected player2: Mesh;
	protected scoreFont: FontFace | null;
	protected leftScore: Mesh | null;
	protected rightScore: Mesh | null;
	protected leftAvatar: Sprite | null;
	protected rightAvatar: Sprite | null;
	protected leftAvatarImage: Texture | null;
	protected rightAvatarImage: Texture | null;
	protected textFont: FontFace | null;
	protected text: Mesh | null;

	constructor(config: mapConfig, options: options, team: team)
	{
		this.config = config;
		this.options = Object.assign({}, {
			qualityLevel: 1,
			targetElem: document.body,
			onReady: () => {},
			onProgress: () => {},
			onError: (ressourceUrl: string) => {console.log("Failed to fetch", ressourceUrl)},
			onMove: () => {},
		}, options);
		this.state = {
			team,
			players: [0.5, 0.5],
			scores: [0, 0],
			ballX: 0.5,
			ballY: 0,
			ballSpeedX: 0,
			ballSpeedY: 0,
			paused: true,
			text: "",
			textSize: 1,
			textColor: 0xffffff,
			avatars: [null, null],
		};

		this._init();
	}

	track(elem: any)
	{
		if (elem && (elem.dispose || elem.length))
			this.disposable.push(elem);
		return (elem);
	}
	
	_getFontGeometry(font: FontFace, text: string, sizeRatio = 1)
	{
		const {gameScale} = this.config;

		const textGeometry = 
			new TextGeometry(
				text,
				{
					font,
					size: 8 * gameScale * sizeRatio,
					height: 1 * gameScale * sizeRatio,
					curveSegments: 3,
					bevelEnabled: false,
				}
			);
		
		textGeometry.computeBoundingBox();
		textGeometry.center();

		return (textGeometry);
	}

	_basicRotationLerp(euler1: Euler, euler2: Euler, ratio: number): Euler
	{
		return (
			euler1.set(
				euler1.x * (1-ratio) + euler2.x * ratio,
				euler1.y * (1-ratio) + euler2.y * ratio,
				euler1.z * (1-ratio) + euler2.z * ratio,
			)
		)
	}

	_refreshEnv(canUseSkyboxAsEnvironment: boolean)
	{
		const {
			skyboxAsEnvironment
		} = this.config;

		this.scene.background = this.envTexture;
		if (skyboxAsEnvironment && canUseSkyboxAsEnvironment)
			this.scene.environment = this.envTexture;
		else
			this.scene.environment = null;
	}

	_refreshFloorReflection()
	{
		const {
			gameScale, baseSize,
			floorReflectivity, floorReflectorColor,
		} = this.config;
		const {
			qualityLevel, 
			width, height,
		} = this.options;
		const {
			reflection, reflectionQuality, reflectionMultisample,
		} = qualities[qualityLevel] as quality;


		if (this.floorMirror)
		{
			this.scene.remove(this.floorMirror);
			this.floorMirror.geometry.dispose();
			this.floorMirror.dispose();
		}
		if (reflection && floorReflectivity > 0.001)
		{
			const floorMirrorGeometry = new PlaneBufferGeometry(
				baseSize[0] * gameScale,
				baseSize[1] * gameScale
			);
			this.floorMirror = new Reflector(floorMirrorGeometry, {
				clipBias: 0.003,
				textureWidth: width * (reflectionQuality || 1),
				textureHeight: height * (reflectionQuality || 1),
				color: floorReflectorColor,
				multisample: reflectionMultisample
			});
			this.floorMirror.rotation.x = -Math.PI / 2;
			this.floorMirror.position.y = -gameScale / 2;
			this.floorMirror.matrixAutoUpdate = false;
			this.floorMirror.updateMatrix();
			this.scene.add( this.floorMirror );


			(this.floor.material as Material).transparent = true;
			(this.floor.material as Material).opacity = (1 - floorReflectivity);
		}
		else
		{
			(this.floor.material as Material).transparent = false;
			(this.floor.material as Material).opacity = 1;
		}
	}

	_refreshQuality()
	{
		const {
			sceneFile, additionnalLight,
			skybox, skyboxAsEnvironment, EnvironmentColor,
		} = this.config;
		const {
			qualityLevel, 
		} = this.options;
		const {
			critical,
			pixelRatio,
			useShadowmap, shadowmap, shadowmapSize,
			reflection,
			canUseSkyboxAsEnvironment
		} = qualities[qualityLevel] as quality;
		const _self = this;

		if (pixelRatio == 'device')
			this.renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
		else
			this.renderer.setPixelRatio( pixelRatio || 1 );

		if (useShadowmap)
		{
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = (shadowmap as ShadowMapType);
		}
		else
		{
			this.renderer.shadowMap.enabled = false;
		}

		this._refreshFloorReflection();

		if ((reflection || !sceneFile) && skybox)
		{
			if (this.envTexture)
				this._refreshEnv(canUseSkyboxAsEnvironment);
			else
			{
				this.skyboxLoader.load(skybox, function (texture: Texture)
				{
					_self.envTexture = texture;
					_self.track(texture);
					_self._refreshEnv(canUseSkyboxAsEnvironment);
				});
			}
		}
		else
		{
			this.scene.background = null;
			this.scene.environment = null;
		}


		if (!skybox || !(skyboxAsEnvironment && canUseSkyboxAsEnvironment))
		{
			this.envLight = new AmbientLight( EnvironmentColor, 1.0 );
			this.envLight.matrixAutoUpdate = false;
			this.envLight.updateMatrix();
			this.scene.add( this.envLight );
		}
		else if (this.envLight)
		{
			this.scene.remove(this.envLight);
			this.envLight.dispose();
			this.envLight = null;
		}

		this.scene.traverse(
			function (node: any)
			{
				if (node.isLight)
				{
					if ("shadow" in node)
					{
						node.shadow.mapSize.width =
							node.shadow.mapSize.height =
								shadowmapSize;
						if (node.shadow.map)
						{
							node.shadow.map.dispose();
							node.shadow.map = null;
						}
					}
					if (critical && additionnalLight)
					{
						if (additionnalLight.includes(node.name))
							node.visible = false;
					}
					else
						node.visible = true;
				}
			}
		);
	}

	_refreshSize()
	{
		const {
			width, height,
		} = this.options;

		this.renderer.setSize( width, height );
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this._refreshFloorReflection();
	}

	_init()
	{
		const {
			cameraClip, sceneFile,
			gameScale, pauseCameraPosition, pauseCameraRotation,
			ballMaterial, baseSize,
			floorMaterial,
			playerSize, player1Material, player2Material, moveSteps,
			scoreFont, textFont,
			lightDecayFactor, lightIntensityFactor,
		} = this.config;
		const {
			width, height,
			targetElem,
			onReady, onProgress, onError
		} = this.options;

		const _self = this;
		this.disposable = [];
		this.clock = new Clock();
		this.disposed = false;

		this.playerMoveDistance = (baseSize[1] - playerSize[1] ) * gameScale;
		this.ballMoveDistanceX = (baseSize[0] - 3) * gameScale;
		this.ballMoveDistanceY = (baseSize[1] - 1) * gameScale;
		this.moveDelta = 1 / moveSteps;

		this.loadingManager = new LoadingManager();
		this.gltfLoader = new GLTFLoader(this.loadingManager);
		this.fontLoader = new FontLoader(this.loadingManager);
		this.skyboxLoader = new CubeTextureLoader(this.loadingManager);
		
		this.scene = new Scene();

		this.camera = new PerspectiveCamera(
			60,
			width / height,
			cameraClip[0],
			cameraClip[1]
		);
		
		this.camera.position.copy(pauseCameraPosition).multiplyScalar(gameScale);
		this.camera.rotation.copy(pauseCameraRotation);
		
		this.renderer = new WebGLRenderer({
			antialias: true,
			powerPreference: "high-performance",
			canvas: targetElem
		});
		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputEncoding = LinearEncoding;
		this.renderer.toneMapping = ACESFilmicToneMapping;

		const ballGeometry = this.track(new BoxBufferGeometry(gameScale, gameScale, gameScale));
		this.ball = this.track(new Mesh( ballGeometry, ballMaterial ));
		this.ball.receiveShadow = true;
		this.ball.castShadow = true;
		this.scene.add( this.ball );

		const floorGeometry = this.track(new BoxBufferGeometry(
			baseSize[0] * gameScale,
			baseSize[1] * gameScale,
			gameScale
		));

		this.floor = this.track(new Mesh( floorGeometry, floorMaterial ));
		(this.floor.material as Material).dithering = true;
		this.floor.receiveShadow = true;
		this.floor.castShadow = true;
		this.floor.rotation.x = -Math.PI / 2;
		this.floor.position.y = -gameScale + 0.005;
		this.floor.renderOrder = 3;
		this.floor.matrixAutoUpdate = false;
		this.floor.updateMatrix();
		this.scene.add( this.floor );

		const playersGeometry = this.track(new BoxBufferGeometry(playerSize[0] * gameScale, gameScale, playerSize[1] * gameScale));
		const playerPosX = (baseSize[0] - playerSize[0]) / 2;

		this.player1 = this.track(new Mesh( playersGeometry, player1Material ));
		this.player1.position.x = -playerPosX * gameScale;
		this.player1.receiveShadow = true;
		this.player1.castShadow = true;
		this.scene.add( this.player1 );

		this.player2 = this.track(new Mesh( playersGeometry, player2Material ));
		this.player2.position.x = playerPosX * gameScale;
		this.player2.receiveShadow = true;
		this.player2.castShadow = true;
		this.scene.add( this.player2 );

		if (sceneFile)
		{
			this.gltfLoader.load(
				sceneFile,
				function (gltf: any)
				{			
					gltf.scene.traverse(
						function (node: any)
						{
							if (node.isLight)
							{
								node.castShadow = true;
								node.receiveShadow = true;
								node.decay *= lightDecayFactor;
								node.intensity *= lightIntensityFactor;
							}
							if (node.isMesh)
							{
								node.castShadow = true;
								node.receiveShadow = true;
								_self.track(node.geometry);
								_self.track(node.material);
							}
							node.matrixAutoUpdate = false;
							node.updateMatrix();
							_self.track(node);
						}
					);
					_self.scene.add(gltf.scene);
					_self._refreshQuality();
				}
			);
		}

		this.scoreFont = null;
		this.rightScore = null;
		this.leftScore = null;
		this.leftAvatar = null;
		this.rightAvatar = null;

		this.fontLoader.load(
			scoreFont,
			function (font: FontFace)
			{
				_self.scoreFont = _self.track(font);
				_self._refreshScore();
			}
		);

		this.textFont = null;

		this.fontLoader.load(
			textFont,
			function (font: FontFace)
			{
				_self.textFont = _self.track(font);
				_self._refreshText();
			}
		);

		this._refreshQuality();
		this._refreshSize();

		this.loadingManager.onLoad =
			() => {
				if (onReady)
				{
					this.render();
					onReady();
					console.log("Scene polycount:", this.renderer.info.render.triangles)
					console.log("Active Drawcalls:", this.renderer.info.render.calls)
					console.log("Textures in Memory", this.renderer.info.memory.textures)
					console.log("Geometries in Memory", this.renderer.info.memory.geometries)
				}
			};
		this.loadingManager.onProgress = onProgress;
		this.loadingManager.onError = onError;
	}

	_play()
	{
		const _self = this;
		const {moveStatusRouding} = this.config;
		const {paused, players, team} = this.state;

		if (!paused)
			return ;

		this.scrollMovementCallback =
			(e) => {
				e.preventDefault();

				const previousPos = players[team];
			
				players[team] += _self.moveDelta * ( (e.deltaY > 0) ? 1 : -1 );
				if (moveStatusRouding)
					players[team] = Math.round(players[team] * 1000) / 1000;
				if (players[team] > 1)
					players[team] = 1;
				else if (players[team] < 0)
					players[team] = 0;
				
				if (players[team] != previousPos)
					_self.options.onMove(players[team]);
			};
		this.renderer.domElement.addEventListener("wheel", this.scrollMovementCallback);
	}

	_pause()
	{
		const {paused} = this.state;

		if (paused)
			return ;

		if (this.scrollMovementCallback)
			this.renderer.domElement.removeEventListener("wheel", this.scrollMovementCallback);
		this.scrollMovementCallback = null;
	}

	_refreshScore()
	{
		const {scores} = this.state;
		const {gameScale, scoreMaterial, scorePositions, scoreRotations} = this.config;

		if (!this.scoreFont)
		{
			console.log("Trying to set score when not ready");
			return ;
		}
		
		if (this.leftScore)
		{
			this.scene.remove(this.leftScore);
			this.leftScore.geometry.dispose();
		}

		const leftScoreGeometry = this._getFontGeometry(this.scoreFont, scores[0] + '');
		this.leftScore = new Mesh( leftScoreGeometry, scoreMaterial );
		this.leftScore.receiveShadow = true;
		this.leftScore.castShadow = true;
		this.leftScore.position.copy(scorePositions[0]).multiplyScalar(gameScale);
		this.leftScore.rotation.copy(scoreRotations[0]);
		this.leftScore.matrixAutoUpdate = false;
		this.leftScore.updateMatrix();
		this.scene.add(this.leftScore);
		
		if (this.rightScore)
		{
			this.scene.remove(this.rightScore);
			this.rightScore.geometry.dispose();
		}

		const rightScoreGeometry = this._getFontGeometry(this.scoreFont, scores[1] + '');
		this.rightScore = new Mesh( rightScoreGeometry, scoreMaterial );
		this.rightScore.receiveShadow = true;
		this.rightScore.castShadow = true;
		this.rightScore.position.copy(scorePositions[1]).multiplyScalar(gameScale);
		this.rightScore.rotation.copy(scoreRotations[1]);
		this.rightScore.matrixAutoUpdate = false;
		this.rightScore.updateMatrix();
		this.scene.add(this.rightScore);
	}

	_refreshAvatar()
	{
		const {avatars} = this.state;
		const {gameScale, avatarPositions, avatarScale} = this.config;

		if (this.leftAvatar)
		{
			this.scene.remove(this.leftAvatar);
			this.leftAvatarImage.dispose();
			this.leftAvatar.geometry.dispose();
			this.leftAvatar.material.dispose();
			this.leftAvatar = null;
		}

		if (avatars[0])
		{
			this.leftAvatarImage = new TextureLoader().load( avatars[0] );
			this.leftAvatarImage.encoding = sRGBEncoding;
			const leftAvatarMaterial = new SpriteMaterial( { map: this.leftAvatarImage } );
			this.leftAvatar = new Sprite( leftAvatarMaterial );
			this.leftAvatar.scale.set(avatarScale,avatarScale,1);
			this.leftAvatar.position.copy(avatarPositions[0]).multiplyScalar(gameScale);
			this.leftAvatar.matrixAutoUpdate = false;
			this.leftAvatar.updateMatrix();
			this.scene.add( this.leftAvatar );
		}

		if (this.rightAvatar)
		{
			this.scene.remove(this.rightAvatar);
			this.rightAvatarImage.dispose();
			this.rightAvatar.geometry.dispose();
			this.rightAvatar.material.dispose();
			this.rightAvatar = null;
		}

		if (avatars[1])
		{
			this.rightAvatarImage = new TextureLoader().load( avatars[1] );
			this.rightAvatarImage.encoding = sRGBEncoding;
			const rightAvatarMaterial = new SpriteMaterial( { map: this.rightAvatarImage } );
			this.rightAvatar = new Sprite( rightAvatarMaterial );
			this.rightAvatar.scale.set(avatarScale, avatarScale,1);
			this.rightAvatar.position.copy(avatarPositions[1]).multiplyScalar(gameScale);
			this.rightAvatar.matrixAutoUpdate = false;
			this.rightAvatar.updateMatrix();
			this.scene.add( this.rightAvatar );
		}
	}

	_refreshText()
	{
		const {text, textSize, textColor, paused} = this.state;
		const {gameScale, textMaterial, textPausePosition, textPlayPosition, textPauseRotation, textPlayRotation} = this.config;
		var oldPos, oldRot;

		if (!this.textFont)
		{
			console.log("Trying to set text when not ready");
			return ;
		}
		
		if (this.text)
		{
			oldPos = this.text.position.clone();
			oldRot = this.text.rotation.clone();
			this.scene.remove(this.text);
			this.text.geometry.dispose();
		}
		else
		{
			oldPos = (paused ? textPausePosition : textPlayPosition).clone().multiplyScalar(gameScale);
			oldRot = paused ? textPauseRotation : textPlayRotation;
		}

		textMaterial.color.set(textColor);
		if ('emissive' in textMaterial)
			textMaterial.emissive.set(textColor);
		const textGeometry = this._getFontGeometry(this.textFont, text, textSize);
		this.text = new Mesh( textGeometry, textMaterial );
		this.text.receiveShadow = true;
		this.text.castShadow = true;
		this.text.position.copy(oldPos);
		this.text.rotation.copy(oldRot);
		this.scene.add(this.text);
	}

	render()
	{
		if (this.disposed)
			return ;
		
		const delta = this.clock.getDelta();

		clientLogic(this.state, this.config, delta);

		const {players, ballX, ballY, paused, ballSpeedX, ballSpeedY} = this.state;
		const {
			transitionSpeed, gameScale,
			pauseCameraPosition, pauseCameraRotation, playCameraPosition, playCameraRotation,
			textPausePosition, textPauseRotation, textPlayPosition, textPlayRotation
		} = this.config;

		this.player1.position.z = (players[0] - 0.5) * this.playerMoveDistance;
		this.player2.position.z = (players[1] - 0.5) * this.playerMoveDistance;
		this.ball.position.x = (ballX - 0.5) * this.ballMoveDistanceX;
		this.ball.position.z = (ballY - 0.5) * this.ballMoveDistanceY;

		const lerpValue = Math.min(1, delta * transitionSpeed);

		if (paused)
		{
			this.camera.position.lerp(pauseCameraPosition.clone().multiplyScalar(gameScale), lerpValue);
			this._basicRotationLerp(this.camera.rotation, pauseCameraRotation, lerpValue);

			if (this.text)
			{
				this.text.position.lerp(textPausePosition.clone().multiplyScalar(gameScale), lerpValue);
				this._basicRotationLerp(this.text.rotation, textPauseRotation, lerpValue);
			}
		}
		else
		{
			this.camera.position.lerp(playCameraPosition.clone().multiplyScalar(gameScale), lerpValue);
			this._basicRotationLerp(this.camera.rotation, playCameraRotation, lerpValue);

			if (this.text)
			{
				this.text.position.lerp(textPlayPosition.clone().multiplyScalar(gameScale), lerpValue);
				this._basicRotationLerp(this.text.rotation, textPlayRotation, lerpValue);
			}
		}

		this.ball.visible = (ballSpeedX != 0 || ballSpeedY != 0);

		this.renderer.render(this.scene, this.camera);
	}

	setAnimationLoop(animate: () => void)
	{
		this.renderer.setAnimationLoop(animate);
	}

	setState(state: state, ping: number)
	{
		const oldState = Object.assign({}, this.state);
		const newState = Object.assign({}, this.state, state);

		if (oldState.paused != newState.paused)
		{
			if (newState.paused)
				this._pause();
			else
				this._play();
		}
		else if (!newState.paused && state.players)
		{
			state.players[state.team] = oldState.players[oldState.team];
		}

		
		this.state = Object.assign(this.state, state);
		
		if (newState.scores[0] != oldState.scores[0] || newState.scores[1] != oldState.scores[1])
			this._refreshScore();
		
		if (newState.text != oldState.text || newState.textSize != oldState.textSize || newState.textColor != oldState.textColor)
			this._refreshText();

		if (newState.avatars[0] != oldState.avatars[0] || newState.avatars[1] != oldState.avatars[1])
			this._refreshAvatar();

		if (ping)
		{
			this.clock.getDelta();
			clientLogic(this.state, this.config, ping / 2)
		}
	}

	setSize(width: number, height: number)
	{
		this.options.width = width;
		this.options.height = height;
		this._refreshSize();
	}

	setQuality(quality: number)
	{
		quality = Math.min(quality, qualities.length - 1);
		quality = Math.max(quality, 0);

		this.options.qualityLevel = quality;
		this._refreshQuality();
	}

	dispose()
	{
		this.disposed = true;
		this._pause();

		if (this.floorMirror)
		{
			this.track(this.floorMirror.geometry);
			this.track(this.floorMirror.material);
			this.track(this.floorMirror);
		}
		if (this.leftScore)
		{
			this.track(this.leftScore.geometry);
			this.track(this.leftScore);
		}
		if (this.rightScore)
		{
			this.track(this.rightScore.geometry);
			this.track(this.rightScore);
		}
		if (this.envLight)
			this.track(this.envLight);
		if (this.leftAvatarImage)
			this.track(this.leftAvatarImage);
		if (this.leftAvatar)
		{
			this.track(this.leftAvatar.geometry);
			this.track(this.leftAvatar.material);
			this.track(this.leftAvatar);
		}
		if (this.rightAvatarImage)
			this.track(this.rightAvatarImage);
		if (this.rightAvatar)
		{
			this.track(this.rightAvatar.geometry);
			this.track(this.rightAvatar.material);
			this.track(this.rightAvatar);
		}
		if (this.text)
		{
			this.track(this.text.geometry);
			this.track(this.text);
		}

		this.track(this.camera);
		// this.track(this.scene);
		this.track(this.renderer);
		this.track(this.clock);
		this.track(this.skyboxLoader);
		this.track(this.fontLoader);
		this.track(this.gltfLoader);
		this.track(this.loadingManager);

		for (let i = 0; i < this.disposable.length - 1; ++i)
		{
			if (this.disposable[i].dispose)
				this.disposable[i].dispose();
			else if (this.disposable[i].length)
			{
				for (let j = 0; j < this.disposable[i].length - 1; j++)
					this.track(this.disposable[i][j]);
			}
			else
				console.log("Not disposable", this.disposable[i]);
		}
		this.disposable = [];
		this.renderer.renderLists.dispose();
	}
};

export type {mapConfig, options};
export default PongScene;