import { Injectable } from '@nestjs/common';
import { ISessionStorage } from './storage.interface';
import { GameSession } from '../../business/domain/game-session';

@Injectable()
export class InMemoryStorage implements ISessionStorage {
  private readonly store = new Map<string, GameSession>();

  async save(session: GameSession): Promise<void> {
    this.store.set(session.id, session);
  }

  async load(id: string): Promise<GameSession | null> {
    return this.store.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async list(): Promise<GameSession[]> {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}
