import { BadRequestException } from '@nestjs/common';
import { GameState } from '../game-state';
import {
  TicTacToeMove,
  EndCondition,
} from '../../../../shared/types/move.types';

const WIN_LINES: [[number, number], [number, number], [number, number]][] = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 2],
    [1, 2],
    [2, 2],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  [
    [0, 2],
    [1, 1],
    [2, 0],
  ],
];

export class TicTacToeRules {
  static validate(state: GameState, move: TicTacToeMove): void {
    if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2) {
      throw new BadRequestException(
        `Posisi (${move.row},${move.col}) di luar papan 3x3.`,
      );
    }
    if (state.boardState[move.row][move.col] !== '') {
      throw new BadRequestException(
        `Cell (${move.row},${move.col}) sudah terisi.`,
      );
    }
    if (state.currentPlayerId !== move.playerId) {
      throw new BadRequestException(
        `Bukan giliran player '${move.playerId}'. Giliran: '${state.currentPlayerId}'.`,
      );
    }
  }

  static apply(state: GameState, move: TicTacToeMove): GameState {
    const newState = state.clone();
    const symbol = TicTacToeRules.getSymbol(state, move.playerId);
    newState.boardState[move.row][move.col] = symbol;
    newState.moveCount += 1;
    newState.lastMoveTimestamp = Date.now();
    const currentIdx = state.playerOrder.indexOf(move.playerId);
    newState.currentPlayerId =
      state.playerOrder[(currentIdx + 1) % state.playerOrder.length];
    return newState;
  }

  static checkEnd(state: GameState): EndCondition {
    const board = state.boardState;

    for (const [[r0, c0], [r1, c1], [r2, c2]] of WIN_LINES) {
      const sym = board[r0][c0];
      if (sym && sym === board[r1][c1] && sym === board[r2][c2]) {
        const winnerIdx = sym === 'X' ? 0 : 1;
        return {
          isOver: true,
          winnerId: state.playerOrder[winnerIdx] ?? null,
          isDraw: false,
        };
      }
    }

    const isFull = board.every((row) => row.every((cell) => cell !== ''));
    if (isFull) {
      return { isOver: true, winnerId: null, isDraw: true };
    }

    return { isOver: false, winnerId: null, isDraw: false };
  }

  static getSymbol(state: GameState, playerId: string): string {
    return state.playerOrder.indexOf(playerId) === 0 ? 'X' : 'O';
  }
}
