import { Injectable, NotFoundException } from '@nestjs/common';
import { GameSession } from '../../business/domain/game-session';

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

  getByPlayer(playerId: string): GameSession[] {
    return this.getAll().filter((s) =>
      s.players.some((p) => p.id === playerId),
    );
  }

  has(id: string): boolean {
    return this.sessions.has(id);
  }
}
