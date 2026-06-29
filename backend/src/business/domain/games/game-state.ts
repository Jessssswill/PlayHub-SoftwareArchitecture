import { Cloneable } from '../../../shared/types/cloneable.interface';

export class GameState implements Cloneable<GameState> {
  boardState: string[][];
  currentPlayerId: string;
  moveCount: number;
  lastMoveTimestamp: number | null;
  capturedPieces: string[];
  playerOrder: string[];

  constructor(data: {
    boardState: string[][];
    currentPlayerId: string;
    moveCount?: number;
    lastMoveTimestamp?: number | null;
    capturedPieces?: string[];
    playerOrder?: string[];
  }) {
    this.boardState = data.boardState;
    this.currentPlayerId = data.currentPlayerId;
    this.moveCount = data.moveCount ?? 0;
    this.lastMoveTimestamp = data.lastMoveTimestamp ?? null;
    this.capturedPieces = data.capturedPieces ?? [];
    this.playerOrder = data.playerOrder ?? [];
  }

  clone(): GameState {
    return new GameState({
      boardState: this.boardState.map((row) => [...row]),
      currentPlayerId: this.currentPlayerId,
      moveCount: this.moveCount,
      lastMoveTimestamp: this.lastMoveTimestamp,
      capturedPieces: [...this.capturedPieces],
      playerOrder: [...this.playerOrder],
    });
  }
}
