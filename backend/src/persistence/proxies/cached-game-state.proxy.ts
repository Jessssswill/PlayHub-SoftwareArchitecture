import { Injectable } from '@nestjs/common';
import { GameEngineFacade } from '../../business/facades/game-engine.facade';
import { GameState } from '../../business/domain/games/game-state';

interface CacheEntry {
  state: GameState;
  ts: number;
}

@Injectable()
export class CachedGameStateProxy {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly subscribed = new Set<string>();
  private readonly TTL_MS = 1000;

  constructor(private readonly facade: GameEngineFacade) {}

  async getState(sessionId: string): Promise<GameState> {
    const cached = this.cache.get(sessionId);
    if (cached && Date.now() - cached.ts < this.TTL_MS) {
      return cached.state;
    }

    const state = await this.facade.getState(sessionId);

    if (!this.subscribed.has(sessionId)) {
      const session = this.facade.getSession(sessionId);
      session.emitter.on('move.applied', () => this.invalidate(sessionId));
      this.subscribed.add(sessionId);
    }

    this.cache.set(sessionId, { state, ts: Date.now() });
    return state;
  }

  invalidate(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  get cacheSize(): number {
    return this.cache.size;
  }
}
