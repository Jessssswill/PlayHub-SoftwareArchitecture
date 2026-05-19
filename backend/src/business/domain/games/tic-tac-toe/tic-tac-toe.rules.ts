import { BadRequestException } from '@nestjs/common';
import { GameState } from '../game-state';
import { TicTacToeMove, EndCondition } from '../../../../shared/types/move.types';

/** Semua kombinasi 3-in-a-row pada papan 3×3. */
const WIN_LINES: [[number, number], [number, number], [number, number]][] = [
  // Rows
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  // Columns
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  // Diagonals
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

/**
 * Pure logic TicTacToe — tidak ada dependency ke NestJS.
 * Semua method static sehingga bisa di-test langsung tanpa instantiasi.
 */
export class TicTacToeRules {
  static validate(state: GameState, move: TicTacToeMove): void {
    if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2) {
      throw new BadRequestException(
        `Posisi (${move.row},${move.col}) di luar papan 3×3.`,
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
    // Ganti giliran ke player berikutnya
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
        // Tentukan winnerId dari simbol: 'X' → playerOrder[0], 'O' → playerOrder[1]
        const winnerIdx = sym === 'X' ? 0 : 1;
        return {
          isOver: true,
          winnerId: state.playerOrder[winnerIdx] ?? null,
          isDraw: false,
        };
      }
    }

    // Seri jika semua cell terisi dan tidak ada pemenang
    const isFull = board.every((row) => row.every((cell) => cell !== ''));
    if (isFull) {
      return { isOver: true, winnerId: null, isDraw: true };
    }

    return { isOver: false, winnerId: null, isDraw: false };
  }

  /** Index 0 di playerOrder → 'X', index 1 → 'O'. */
  static getSymbol(state: GameState, playerId: string): string {
    return state.playerOrder.indexOf(playerId) === 0 ? 'X' : 'O';
  }
}
