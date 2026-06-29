import { Injectable, BadRequestException } from '@nestjs/common';
import { GameSession } from '../domain/game-session';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Move } from '../../shared/types/move.types';
import { Game } from '../domain/games/game.abstract';

@Injectable()
export class MoveValidationService {
  validate(session: GameSession, playerId: string, move: Move, engine: Game): void {
    if (session.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException('Game tidak sedang berjalan');
    }
    if (session.getCurrentPlayer() !== playerId) {
      throw new BadRequestException('Bukan giliran Anda');
    }
    if (!engine.isValidMove(session.getState(), move)) {
      throw new BadRequestException('Move tidak valid');
    }
  }
}
