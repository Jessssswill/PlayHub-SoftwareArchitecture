import { BadRequestException } from '@nestjs/common';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move } from '../../../shared/types/move.types';
import { IGameLifecycleState } from './game-lifecycle-state.interface';
import { ISessionContext } from './session-context.interface';
import { InProgressState } from './in-progress.state';

export class PausedState implements IGameLifecycleState {
  getName(): GameStatus {
    return GameStatus.PAUSED;
  }

  joinPlayer(_session: ISessionContext, _player: Player): void {
    throw new BadRequestException('Game sedang di-pause. Tidak bisa bergabung.');
  }

  canAcceptMove(_session: ISessionContext, _move: Move): void {
    throw new BadRequestException('Game di-pause. Resume dulu sebelum membuat move.');
  }

  startGame(_session: ISessionContext): void {
    throw new BadRequestException('Game sudah dimulai sebelumnya, gunakan resume.');
  }

  pause(_session: ISessionContext): void {
    throw new BadRequestException('Game sudah di-pause.');
  }

  resume(session: ISessionContext): void {
    session.transitionTo(new InProgressState());
  }

  finish(session: ISessionContext): void {
    const { FinishedState } = require('./finished.state') as typeof import('./finished.state');
    session.transitionTo(new FinishedState());
  }
}
