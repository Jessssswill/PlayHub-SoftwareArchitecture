import { Injectable, BadRequestException } from '@nestjs/common';
import { IAIEngine } from './ai-engine.interface';
import { GameState } from '../../business/domain/games/game-state';
import { GameType } from '../../shared/types/game-type.enum';
import { Move, TicTacToeMove, ChessMove } from '../../shared/types/move.types';
import { ChessRules } from '../../business/domain/games/chess/chess.rules';

@Injectable()
export class RandomAiAdapter implements IAIEngine {
  async getNextMove(state: GameState, gameType: GameType): Promise<Move> {
    switch (gameType) {
      case GameType.TIC_TAC_TOE:
        return this.randomTicTacToeMove(state);
      case GameType.CHESS:
        return this.randomChessMove(state);
      default:
        throw new BadRequestException(
          `AI belum mendukung game type: ${gameType}`,
        );
    }
  }

  private randomTicTacToeMove(state: GameState): TicTacToeMove {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < state.boardState.length; r++) {
      for (let c = 0; c < state.boardState[r].length; c++) {
        if (state.boardState[r][c] === '') emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) {
      throw new BadRequestException('Tidak ada cell kosong tersisa untuk AI.');
    }
    const [row, col] =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return {
      gameType: GameType.TIC_TAC_TOE,
      playerId: state.currentPlayerId,
      row,
      col,
    };
  }

  private randomChessMove(state: GameState): ChessMove {
    const isWhite = state.playerOrder[0] === state.currentPlayerId;

    const ownPieces: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = state.boardState[r][c];
        if (!cell) continue;
        const cellIsWhite = cell === cell.toUpperCase();
        if (isWhite === cellIsWhite) ownPieces.push([r, c]);
      }
    }

    for (let attempt = 0; attempt < 200; attempt++) {
      const [fr, fc] = ownPieces[Math.floor(Math.random() * ownPieces.length)];
      const tr = Math.floor(Math.random() * 8);
      const tc = Math.floor(Math.random() * 8);
      const candidate: ChessMove = {
        gameType: GameType.CHESS,
        playerId: state.currentPlayerId,
        from: { row: fr, col: fc },
        to: { row: tr, col: tc },
      };
      try {
        ChessRules.validate(state, candidate);
        return candidate;
      } catch {}
    }
    throw new BadRequestException(
      'AI tidak menemukan move valid setelah 200 percobaan.',
    );
  }
}
