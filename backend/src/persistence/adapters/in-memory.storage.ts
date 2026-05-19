import { Injectable } from '@nestjs/common';
import { ISessionStorage } from './storage.interface';
import { GameSession } from '../../business/domain/game-session';

/**
 * @pattern Adapter (ConcreteAdapter)
 * @intent Implementasi ISessionStorage berbasis Map di memori.
 *         Digunakan untuk testing dan development tanpa SQLite overhead.
 * @participants ISessionStorage (target), Map (adaptee)
 */
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

  /** Helper untuk test — reset store. */
  clear(): void {
    this.store.clear();
  }
}
