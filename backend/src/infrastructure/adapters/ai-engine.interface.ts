import { GameState } from '../../business/domain/games/game-state';
import { GameType } from '../../shared/types/game-type.enum';
import { Move } from '../../shared/types/move.types';

/**
 * @pattern Adapter (Target Interface)
 * @intent Interface unified untuk AI move generation sehingga implementasi berbeda
 *         (random, minimax, external engine) bisa di-swap tanpa modify client code.
 *         GameEngineFacade hanya kenal interface ini, tidak tahu concrete adapter-nya.
 * @participants RandomAiAdapter, MinimaxAiAdapter, ExternalEngineAdapter (Adaptee)
 */
export interface IAIEngine {
  getNextMove(state: GameState, gameType: GameType): Promise<Move>;
}

export const AI_ENGINE_TOKEN = 'IAIEngine';
