import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move } from '../../../shared/types/move.types';
import { ISessionContext } from './session-context.interface';

/**
 * @pattern State
 * @intent Encapsulate behavior session-lifecycle agar action handler
 *         (joinPlayer, makeMove, pause) berperilaku berbeda berdasarkan state saat ini,
 *         tanpa conditional besar di tiap method GameSession.
 * @participants WaitingForPlayersState, InProgressState, PausedState, FinishedState
 *               (ConcreteState), GameSession (Context via ISessionContext)
 */
export interface IGameLifecycleState {
  getName(): GameStatus;

  /** Tambah player ke sesi. Hanya valid saat WAITING. */
  joinPlayer(session: ISessionContext, player: Player): void;

  /**
   * Lifecycle guard sebelum move dieksekusi oleh facade.
   * Throw jika state tidak mengizinkan move (misal: game belum mulai).
   * InProgressState tidak throw — facade lanjut ke game engine.
   */
  canAcceptMove(session: ISessionContext, move: Move): void;

  /** Mulai game. Hanya valid saat WAITING. */
  startGame(session: ISessionContext): void;

  /** Pause game. Hanya valid saat IN_PROGRESS. */
  pause(session: ISessionContext): void;

  /** Resume game dari pause. Hanya valid saat PAUSED. */
  resume(session: ISessionContext): void;

  /** Selesaikan game. Valid dari state manapun kecuali FINISHED. */
  finish(session: ISessionContext): void;
}
