import { GameState } from '../../business/domain/games/game-state';
import { GameType } from '../../shared/types/game-type.enum';
import { Move } from '../../shared/types/move.types';

export interface IAIEngine {
  getNextMove(state: GameState, gameType: GameType): Promise<Move>;
}

export const AI_ENGINE_TOKEN = 'IAIEngine';
