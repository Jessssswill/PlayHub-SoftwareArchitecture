import { BadRequestException } from '@nestjs/common';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move } from '../../../shared/types/move.types';
import { IGameLifecycleState } from './game-lifecycle-state.interface';
import { ISessionContext } from './session-context.interface';

export class FinishedState implements IGameLifecycleState {
  getName(): GameStatus {
    return GameStatus.FINISHED;
  }

  private reject(): never {
    throw new BadRequestException('Game sudah selesai. Tidak ada aksi yang diizinkan.');
  }

  joinPlayer(_session: ISessionContext, _player: Player): void {
    this.reject();
  }

  canAcceptMove(_session: ISessionContext, _move: Move): void {
    this.reject();
  }

  startGame(_session: ISessionContext): void {
    this.reject();
  }

  pause(_session: ISessionContext): void {
    this.reject();
  }

  resume(_session: ISessionContext): void {
    this.reject();
  }

  finish(_session: ISessionContext): void {
    this.reject();
  }
}
