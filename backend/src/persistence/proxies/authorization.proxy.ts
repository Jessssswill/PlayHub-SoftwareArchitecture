import { Injectable, ForbiddenException } from '@nestjs/common';
import { GameEngineFacade } from '../../business/facades/game-engine.facade';
import { GameRegistry } from '../../infrastructure/registry/game-registry.service';
import { Move } from '../../shared/types/move.types';
import { TurnResult } from '../../business/domain/games/game.abstract';
import { GameSession } from '../../business/domain/game-session';
import { Player } from '../../shared/types/player.interface';
import { GameType } from '../../shared/types/game-type.enum';

/**
 * @pattern Proxy (Protection Proxy)
 * @intent Enforce authorization sebelum delegasi ke GameEngineFacade (real subject).
 *         Client tidak berinteraksi langsung dengan facade — proxy yang memvalidasi
 *         apakah player punya hak atas operasi yang diminta.
 * @participants GameEngineFacade (RealSubject), GameEngineAuthorizationProxy (Proxy)
 */
@Injectable()
export class GameEngineAuthorizationProxy {
  constructor(
    private readonly real: GameEngineFacade,
    private readonly registry: GameRegistry,
  ) {}

  async createSession(
    gameType: GameType,
    players: [Player, Player],
  ): Promise<GameSession> {
    return this.real.createSession(gameType, players);
  }

  /**
   * Pastikan playerId adalah bagian dari session sebelum izinkan move.
   * Throw ForbiddenException jika bukan player yang terdaftar.
   */
  async makeMove(
    sessionId: string,
    playerId: string,
    move: Move,
  ): Promise<TurnResult> {
    const session = this.registry.get(sessionId);
    const isRegisteredPlayer = session.players.some((p) => p.id === playerId);

    if (!isRegisteredPlayer) {
      throw new ForbiddenException(
        `Player '${playerId}' bukan anggota sesi '${sessionId}'.`,
      );
    }

    return this.real.makeMove(sessionId, playerId, move);
  }

  /**
   * Hanya player dalam sesi yang boleh mengakhiri game.
   * (Host identification tidak ada di scope ini — cukup validasi keanggotaan.)
   */
  async endSession(sessionId: string, requesterId: string): Promise<void> {
    const session = this.registry.get(sessionId);
    const isMember = session.players.some((p) => p.id === requesterId);
    if (!isMember) {
      throw new ForbiddenException(
        `Hanya player dalam sesi yang bisa mengakhiri game.`,
      );
    }
    return this.real.endSession(sessionId);
  }

  async getState(sessionId: string) {
    return this.real.getState(sessionId);
  }

  async joinSession(sessionId: string, player: Player): Promise<void> {
    return this.real.joinSession(sessionId, player);
  }

  listSessions() {
    return this.real.listSessions();
  }
}
