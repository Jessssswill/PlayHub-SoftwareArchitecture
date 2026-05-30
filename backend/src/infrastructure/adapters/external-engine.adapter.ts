import { Injectable } from '@nestjs/common';
import { IAIEngine } from './ai-engine.interface';
import { GameState } from '../../business/domain/games/game-state';
import { GameType } from '../../shared/types/game-type.enum';
import { Move, ChessMove } from '../../shared/types/move.types';

/**
 * @pattern Adapter (ConcreteAdapter — Stub)
 * @intent Mensimulasikan integrasi ke external chess engine (misal Stockfish via HTTP).
 *         Interface tetap IAIEngine sehingga client tidak tahu perbedaan lokal vs remote.
 *         Implementasi nyata akan HTTP-call endpoint Stockfish dan parse response-nya.
 * @participants IAIEngine (target), ExternalEngineAdapter (adapter)
 *
 * NOTE: Ini STUB untuk demonstrasi Adapter pattern. Response di-hardcode.
 *       Real impl: POST to http://stockfish-service/move dengan FEN string,
 *       parse "bestmove e2e4" dari response, convert ke ChessMove.
 */
@Injectable()
export class ExternalEngineAdapter implements IAIEngine {
  async getNextMove(state: GameState, gameType: GameType): Promise<Move> {
    // Simulasi network delay ke external engine
    await this.fakeDelay(100);

    if (gameType === GameType.CHESS) {
      return this.stubChessMove(state);
    }

    // Fallback: hardcoded TicTacToe move (bukan tujuan utama adapter ini)
    return {
      gameType: GameType.TIC_TAC_TOE,
      playerId: state.currentPlayerId,
      row: 0,
      col: 0,
    };
  }

  private stubChessMove(state: GameState): ChessMove {
    // Hardcoded opening move: e2→e4 (white pawn maju 2 langkah)
    // Real impl: panggil Stockfish API, parse "bestmove e2e4", convert ke koordinat
    return {
      gameType: GameType.CHESS,
      playerId: state.currentPlayerId,
      from: { row: 6, col: 4 }, // e2 → row 6, col 4
      to: { row: 4, col: 4 },   // e4 → row 4, col 4
    };
  }

  private fakeDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
