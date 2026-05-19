import { BadRequestException } from '@nestjs/common';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move } from '../../../shared/types/move.types';
import { IGameLifecycleState } from './game-lifecycle-state.interface';
import { ISessionContext } from './session-context.interface';
import { PausedState } from './paused.state';

/**
 * @pattern State (ConcreteState)
 * @intent Sesi sedang berjalan: move diizinkan, pause diizinkan, join ditolak.
 * @participants IGameLifecycleState, GameSession (via ISessionContext)
 */
export class InProgressState implements IGameLifecycleState {
  getName(): GameStatus {
    return GameStatus.IN_PROGRESS;
  }

  joinPlayer(_session: ISessionContext, _player: Player): void {
    throw new BadRequestException('Game sudah berjalan. Tidak bisa bergabung sebagai player.');
  }

  /** Lifecycle guard — tidak throw, facade lanjut ke game engine. */
  canAcceptMove(_session: ISessionContext, _move: Move): void {
    // State IN_PROGRESS mengizinkan move — tidak perlu throw
  }

  startGame(_session: ISessionContext): void {
    throw new BadRequestException('Game sudah berjalan.');
  }

  pause(session: ISessionContext): void {
    session.transitionTo(new PausedState());
  }

  resume(_session: ISessionContext): void {
    throw new BadRequestException('Game tidak sedang di-pause.');
  }

  finish(session: ISessionContext): void {
    const { FinishedState } = require('./finished.state') as typeof import('./finished.state');
    session.transitionTo(new FinishedState());
  }
}
