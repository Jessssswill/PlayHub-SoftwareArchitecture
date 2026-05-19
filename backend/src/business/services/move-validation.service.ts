import { Injectable, BadRequestException } from '@nestjs/common';
import { GameSession } from '../domain/game-session';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Move } from '../../shared/types/move.types';
import { Game } from '../domain/games/game.abstract';

/**
 * Validasi move sebelum dieksekusi. Sequential checks, simple and readable.
 * (Bisa di-refactor ke Chain of Responsibility nanti jika perlu extensibility.)
 */
@Injectable()
export class MoveValidationService {
  validate(session: GameSession, playerId: string, move: Move, engine: Game): void {
    // 1. Game harus IN_PROGRESS
    if (session.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException('Game tidak sedang berjalan');
    }
    // 2. Player harus giliran
    if (session.getCurrentPlayer() !== playerId) {
      throw new BadRequestException('Bukan giliran Anda');
    }
    // 3. Move harus legal (delegate ke game-specific rules)
    if (!engine.isValidMove(session.getState(), move)) {
      throw new BadRequestException('Move tidak valid');
    }
  }
}
