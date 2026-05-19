import { Injectable } from '@nestjs/common';
import { GameEngineFacade } from '../../business/facades/game-engine.facade';
import { GameState } from '../../business/domain/games/game-state';

interface CacheEntry {
  state: GameState;
  ts: number;
}

/**
 * @pattern Proxy (Caching / Virtual Proxy)
 * @intent Cache hasil getState() agar spectator broadcast tidak memicu
 *         registry lookup berulang untuk setiap client. Invalidasi otomatis
 *         saat move.applied diterima dari session emitter.
 * @participants GameEngineFacade (RealSubject), CachedGameStateProxy (Proxy)
 */
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

    // Subscribe ke move.applied sekali per sesi untuk auto-invalidate
    if (!this.subscribed.has(sessionId)) {
      const session = this.facade.getSession(sessionId);
      session.emitter.on('move.applied', () => this.invalidate(sessionId));
      this.subscribed.add(sessionId);
    }

    this.cache.set(sessionId, { state, ts: Date.now() });
    return state;
  }

  /** Hapus cache untuk sesi tertentu — dipanggil juga secara manual jika perlu. */
  invalidate(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  /** Expose cache size untuk keperluan testing. */
  get cacheSize(): number {
    return this.cache.size;
  }
}
