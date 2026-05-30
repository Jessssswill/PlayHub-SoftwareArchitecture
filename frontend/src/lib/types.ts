export enum GameType {
  TIC_TAC_TOE = 'TIC_TAC_TOE',
  CHESS = 'CHESS',
  CONNECT_FOUR = 'CONNECT_FOUR',
}

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  boardState: string[][];
  currentPlayerId: string;
  moveCount: number;
  lastMoveTimestamp: number | null;
  capturedPieces: string[];
  playerOrder: string[];
}

export interface GameSession {
  id: string;
  gameType: GameType;
  status: GameStatus;
  players: Player[];
  currentState: GameState | null;
  createdAt: string;
  timeControlSeconds: number;
  isPrivate: boolean;
  allowSpectators: boolean;
}

export interface EndCondition {
  isOver: boolean;
  winnerId: string | null;
  isDraw: boolean;
}

export interface TurnResult {
  newState: GameState;
  endResult: EndCondition;
}

export interface TicTacToeMove {
  gameType: GameType.TIC_TAC_TOE;
  playerId: string;
  row: number;
  col: number;
}

export interface ChessMove {
  gameType: GameType.CHESS;
  playerId: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export interface ConnectFourMove {
  gameType: GameType.CONNECT_FOUR;
  playerId: string;
  col: number;
}

export type Move = TicTacToeMove | ChessMove | ConnectFourMove;

export interface MoveRecord {
  playerId: string;
  description: string;
  timestamp: number;
}
