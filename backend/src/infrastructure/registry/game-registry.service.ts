import { Injectable, NotFoundException } from '@nestjs/common';
import { GameSession } from '../../business/domain/game-session';

/**
 * @pattern Singleton
 * @intent Satu instance Map yang menyimpan semua sesi aktif di memori,
 *         sehingga tidak ada duplikasi state antar request.
 *         NestJS DI scope default (singleton) merealisasikan pattern ini
 *         secara idiomatik — tidak perlu getInstance() manual.
 * @participants GameSession (stored entity), GameEngineFacade (consumer)
 */
@Injectable()
export class GameRegistry {
  private readonly sessions = new Map<string, GameSession>();

  register(session: GameSession): void {
    this.sessions.set(session.id, session);
  }

  unregister(id: string): void {
    this.sessions.delete(id);
  }

  get(id: string): GameSession {
    const session = this.sessions.get(id);
    if (!session) {
      throw new NotFoundException(`Session '${id}' tidak ditemukan di registry.`);
    }
    return session;
  }

  getAll(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  /** Cari semua session yang mengandung player dengan ID tertentu. */
  getByPlayer(playerId: string): GameSession[] {
    return this.getAll().filter((s) =>
      s.players.some((p) => p.id === playerId),
    );
  }

  has(id: string): boolean {
    return this.sessions.has(id);
  }
}
