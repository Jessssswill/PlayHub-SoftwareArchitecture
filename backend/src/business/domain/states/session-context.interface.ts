import { Player } from '../../../shared/types/player.interface';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Move } from '../../../shared/types/move.types';
import { GameEventEmitter } from '../events/game-event-emitter';
import type { IGameLifecycleState } from './game-lifecycle-state.interface';

export interface ISessionContext {
  readonly id: string;
  players: Player[];
  status: GameStatus;
  readonly emitter: GameEventEmitter;
  transitionTo(newState: IGameLifecycleState): void;
  canAcceptMove(move: Move): void;
}
