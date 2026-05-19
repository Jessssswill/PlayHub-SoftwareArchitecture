import { BadRequestException } from '@nestjs/common';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move } from '../../../shared/types/move.types';
import { IGameLifecycleState } from './game-lifecycle-state.interface';
import { ISessionContext } from './session-context.interface';
import { InProgressState } from './in-progress.state';

/**
 * @pattern State (ConcreteState)
 * @intent Representasi sesi yang belum dimulai: player boleh bergabung,
 *         move ditolak sampai game di-start secara eksplisit.
 * @participants IGameLifecycleState, GameSession (via ISessionContext)
 */
export class WaitingForPlayersState implements IGameLifecycleState {
  getName(): GameStatus {
    return GameStatus.WAITING;
  }

  joinPlayer(session: ISessionContext, player: Player): void {
    session.players.push(player);
    session.emitter.emit('player.joined', { player });
  }

  canAcceptMove(_session: ISessionContext, _move: Move): void {
    throw new BadRequestException('Game belum mulai. Tunggu hingga game di-start.');
  }

  startGame(session: ISessionContext): void {
    if (session.players.length < 2) {
      throw new BadRequestException(
        `Minimal 2 player untuk mulai. Saat ini: ${session.players.length}.`,
      );
    }
    session.transitionTo(new InProgressState());
  }

  pause(_session: ISessionContext): void {
    throw new BadRequestException('Tidak bisa pause — game belum dimulai.');
  }

  resume(_session: ISessionContext): void {
    throw new BadRequestException('Tidak bisa resume — game belum dimulai.');
  }

  finish(session: ISessionContext): void {
    const { FinishedState } = require('./finished.state') as typeof import('./finished.state');
    session.transitionTo(new FinishedState());
  }
}
