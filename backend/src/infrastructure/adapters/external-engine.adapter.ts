import { Injectable } from '@nestjs/common';
import { IAIEngine } from './ai-engine.interface';
import { GameState } from '../../business/domain/games/game-state';
import { GameType } from '../../shared/types/game-type.enum';
import { Move, ChessMove } from '../../shared/types/move.types';

@Injectable()
export class ExternalEngineAdapter implements IAIEngine {
  async getNextMove(state: GameState, gameType: GameType): Promise<Move> {
    await this.fakeDelay(100);

    if (gameType === GameType.CHESS) {
      return this.stubChessMove(state);
    }

    return {
      gameType: GameType.TIC_TAC_TOE,
      playerId: state.currentPlayerId,
      row: 0,
      col: 0,
    };
  }

  private stubChessMove(state: GameState): ChessMove {
    return {
      gameType: GameType.CHESS,
      playerId: state.currentPlayerId,
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
    };
  }

  private fakeDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
