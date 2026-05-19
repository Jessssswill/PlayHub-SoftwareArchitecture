import { Player } from '../../../shared/types/player.interface';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Move } from '../../../shared/types/move.types';
import { GameEventEmitter } from '../events/game-event-emitter';
import type { IGameLifecycleState } from './game-lifecycle-state.interface';

/**
 * Interface minimal yang diekspos GameSession ke concrete states.
 * Menghindari circular import: states tidak import GameSession,
 * hanya ISessionContext — sehingga game-session.ts bisa import states tanpa cycle.
 */
export interface ISessionContext {
  readonly id: string;
  /** Mutable — WaitingForPlayersState butuh push player baru. */
  players: Player[];
  status: GameStatus;
  readonly emitter: GameEventEmitter;
  transitionTo(newState: IGameLifecycleState): void;
  canAcceptMove(move: Move): void;
}
