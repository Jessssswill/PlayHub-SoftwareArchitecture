import { Injectable, NotImplementedException, BadRequestException } from '@nestjs/common';
import { IAIEngine } from './ai-engine.interface';
import { GameState } from '../../business/domain/games/game-state';
import { GameType } from '../../shared/types/game-type.enum';
import { Move, TicTacToeMove } from '../../shared/types/move.types';

interface MinimaxResult {
  score: number;
  row: number;
  col: number;
}

/**
 * @pattern Adapter (ConcreteAdapter)
 * @intent Adaptasi algoritma minimax ke interface IAIEngine.
 *         TicTacToe: minimax depth-9 (exhaustive — ruang state kecil).
 *         Chess: belum diimplementasi (NotImplementedException).
 * @participants IAIEngine (target), MinimaxAiAdapter (adapter)
 */
@Injectable()
export class MinimaxAiAdapter implements IAIEngine {
  async getNextMove(state: GameState, gameType: GameType): Promise<Move> {
    if (gameType === GameType.CHESS || gameType === GameType.CONNECT_FOUR) {
      throw new NotImplementedException(
        `Minimax untuk ${gameType} belum diimplementasikan.`,
      );
    }
    if (gameType !== GameType.TIC_TAC_TOE) {
      throw new BadRequestException(`Game type tidak dikenal: ${gameType}`);
    }
    return this.minimaxMove(state);
  }

  private minimaxMove(state: GameState): TicTacToeMove {
    const aiSymbol = state.playerOrder.indexOf(state.currentPlayerId) === 0 ? 'X' : 'O';
    const oppSymbol = aiSymbol === 'X' ? 'O' : 'X';
    const board = state.boardState.map((row) => [...row]);

    const result = this.minimax(board, aiSymbol, oppSymbol, true);
    if (result.row === -1) {
      throw new BadRequestException('Minimax tidak menemukan move valid — papan sudah penuh?');
    }
    return {
      gameType: GameType.TIC_TAC_TOE,
      playerId: state.currentPlayerId,
      row: result.row,
      col: result.col,
    };
  }

  private minimax(
    board: string[][],
    aiSymbol: string,
    oppSymbol: string,
    isMaximizing: boolean,
  ): MinimaxResult {
    // Cek kondisi terminal
    if (this.checkWin(board, aiSymbol)) return { score: 10, row: -1, col: -1 };
    if (this.checkWin(board, oppSymbol)) return { score: -10, row: -1, col: -1 };

    const emptyCells = this.getEmptyCells(board);
    if (emptyCells.length === 0) return { score: 0, row: -1, col: -1 };

    let best: MinimaxResult = isMaximizing
      ? { score: -Infinity, row: -1, col: -1 }
      : { score: Infinity, row: -1, col: -1 };

    for (const [r, c] of emptyCells) {
      board[r][c] = isMaximizing ? aiSymbol : oppSymbol;
      const result = this.minimax(board, aiSymbol, oppSymbol, !isMaximizing);
      board[r][c] = '';

      const candidate: MinimaxResult = { score: result.score, row: r, col: c };
      if (
        isMaximizing
          ? candidate.score > best.score
          : candidate.score < best.score
      ) {
        best = candidate;
      }
    }
    return best;
  }

  private checkWin(board: string[][], symbol: string): boolean {
    const lines: [number, number][][] = [
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
    ];
    return lines.some(
      ([[r0,c0],[r1,c1],[r2,c2]]) =>
        board[r0][c0] === symbol &&
        board[r1][c1] === symbol &&
        board[r2][c2] === symbol,
    );
  }

  private getEmptyCells(board: string[][]): [number, number][] {
    const cells: [number, number][] = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === '') cells.push([r, c]);
      }
    }
    return cells;
  }
}
