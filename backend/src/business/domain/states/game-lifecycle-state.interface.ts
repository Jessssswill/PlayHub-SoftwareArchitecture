import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move } from '../../../shared/types/move.types';
import { ISessionContext } from './session-context.interface';

export interface IGameLifecycleState {
  getName(): GameStatus;
  joinPlayer(session: ISessionContext, player: Player): void;
  canAcceptMove(session: ISessionContext, move: Move): void;
  startGame(session: ISessionContext): void;
  pause(session: ISessionContext): void;
  resume(session: ISessionContext): void;
  finish(session: ISessionContext): void;
}
