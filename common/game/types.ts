import type { MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial } from 'three';
import { serverState } from './interfaces';

enum teamEnum {
  None = -1,
  Left = 0,
  Right = 1,
}

type Material = MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial | MeshPhongMaterial;
type userId = number;
type team = teamEnum.Left | teamEnum.Right;
type inclusiveTeam = team | teamEnum.None;
type avatar = string | null;

type missedCallback = (state: serverState, remainingDelta: number) => void;
type bouncedCallback = (state: serverState) => void;

type controlsMode = 'wheel' | 'keyboard' | 'mouse';
const controls: controlsMode[] = ['wheel', 'keyboard', 'mouse'];

export { teamEnum, controls };
export type { Material, userId, team, inclusiveTeam, avatar, missedCallback, bouncedCallback, controlsMode };
