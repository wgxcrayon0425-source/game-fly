
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export type Point = {
  r: number;
  c: number;
};

export type Plane = {
  id: string;
  head: Point;
  direction: Direction;
  isDead: boolean;
  bodyParts: Point[];
};

export enum CellStatus {
  UNKNOWN = 'UNKNOWN',
  EMPTY = 'EMPTY',
  INJURED = 'INJURED',
  DEAD = 'DEAD'
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  CONNECTING = 'CONNECTING',
  PLACEMENT_P1 = 'PLACEMENT_P1',
  PLACEMENT_P2 = 'PLACEMENT_P2',
  WAITING_FOR_OPPONENT = 'WAITING_FOR_OPPONENT',
  TRANSITION = 'TRANSITION',
  BATTLE = 'BATTLE',
  OVER = 'OVER'
}

export enum GameMode {
  LOCAL_PVP = 'LOCAL_PVP',
  VS_AI = 'VS_AI',
  ONLINE_PVP = 'ONLINE_PVP'
}

export type BattleState = {
  currentPlayer: 1 | 2;
  p1Planes: Plane[];
  p2Planes: Plane[];
  p1Radar: Record<string, CellStatus>;
  p2Radar: Record<string, CellStatus>;
  winner: 1 | 2 | null;
};

export type NetworkMessage = 
  | { type: 'READY'; planes: Plane[] }
  | { type: 'ATTACK'; r: number; c: number }
  | { type: 'RESULT'; r: number; c: number; status: CellStatus; killedPlaneId?: string }
  | { type: 'SYNC_TURN'; nextPlayer: number };
