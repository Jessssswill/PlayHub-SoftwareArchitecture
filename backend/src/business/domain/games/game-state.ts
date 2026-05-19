import { Cloneable } from '../../../shared/types/cloneable.interface';

/**
 * @pattern Prototype
 * @intent Memungkinkan "preview move" dengan meng-clone state sebelum mutasi,
 *         sehingga state asli tidak berubah saat validasi atau simulasi dilakukan.
 * @participants Cloneable<T> (interface), GameEngineFacade (caller)
 */
export class GameState implements Cloneable<GameState> {
  boardState: string[][];
  currentPlayerId: string;
  moveCount: number;
  lastMoveTimestamp: number | null;
  /** Piece yang di-capture — relevan untuk Chess, kosong untuk TicTacToe. */
  capturedPieces: string[];
  /**
   * Urutan player berdasarkan giliran: index 0 = giliran pertama.
   * TicTacToe: index 0 → simbol 'X', index 1 → simbol 'O'.
   * Chess:     index 0 → putih (uppercase piece), index 1 → hitam (lowercase).
   */
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
