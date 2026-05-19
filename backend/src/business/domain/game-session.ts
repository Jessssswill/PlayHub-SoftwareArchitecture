import { GameType } from '../../shared/types/game-type.enum';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Player } from '../../shared/types/player.interface';
import { Move } from '../../shared/types/move.types';
import { GameState } from './games/game-state';
import { GameEventEmitter } from './events/game-event-emitter';
import { IGameLifecycleState } from './states/game-lifecycle-state.interface';
import { ISessionContext } from './states/session-context.interface';
import { WaitingForPlayersState } from './states/waiting-for-players.state';

/**
 * Domain entity untuk satu sesi game.
 * Mengimplementasikan ISessionContext sehingga bisa diteruskan ke concrete states
 * tanpa menimbulkan circular import (states hanya kenal ISessionContext).
 *
 * @pattern State — lifecycle didelegasikan ke lifecycleState saat ini.
 * @pattern Observer — emitter per-session untuk notifikasi real-time.
 */
export class GameSession implements ISessionContext {
  readonly id: string;
  readonly gameType: GameType;
  players: Player[];
  status: GameStatus;
  currentState: GameState | null;
  readonly createdAt: Date;
  timeControlSeconds: number;
  isPrivate: boolean;
  allowSpectators: boolean;
  maxSpectators: number;

  /** Emitter scoped ke sesi ini — satu instance per session (Observer pattern). */
  readonly emitter: GameEventEmitter;

  /** State machine saat ini (State pattern). */
  private lifecycleState: IGameLifecycleState;

  constructor(data: {
    id: string;
    gameType: GameType;
    players: Player[];
    status: GameStatus;
    currentState: GameState | null;
    createdAt: Date;
    timeControlSeconds: number;
    isPrivate: boolean;
    allowSpectators: boolean;
    maxSpectators: number;
  }) {
    this.id = data.id;
    this.gameType = data.gameType;
    this.players = data.players;
    this.status = data.status;
    this.currentState = data.currentState;
    this.createdAt = data.createdAt;
    this.timeControlSeconds = data.timeControlSeconds;
    this.isPrivate = data.isPrivate;
    this.allowSpectators = data.allowSpectators;
    this.maxSpectators = data.maxSpectators;
    this.emitter = new GameEventEmitter();
    this.lifecycleState = new WaitingForPlayersState();
  }

  // ── State pattern delegation ───────────────────────────────────────────────

  /**
   * Ganti lifecycle state dan emit event state.changed.
   * Dipanggil oleh concrete states saat transisi terjadi.
   */
  transitionTo(newState: IGameLifecycleState): void {
    const from = this.status;
    this.lifecycleState = newState;
    this.status = newState.getName();
    this.emitter.emit('state.changed', { from, to: this.status });
  }

  joinPlayer(player: Player): void {
    this.lifecycleState.joinPlayer(this, player);
  }

  /**
   * Lifecycle guard — dipanggil facade sebelum meneruskan ke game engine.
   * Throw jika state saat ini tidak mengizinkan move.
   */
  canAcceptMove(move: Move): void {
    this.lifecycleState.canAcceptMove(this, move);
  }

  startGame(): void {
    this.lifecycleState.startGame(this);
  }

  pause(): void {
    this.lifecycleState.pause(this);
  }

  resume(): void {
    this.lifecycleState.resume(this);
  }

  finish(): void {
    this.lifecycleState.finish(this);
  }

  getCurrentLifecycleState(): IGameLifecycleState {
    return this.lifecycleState;
  }

  /** Player yang sedang giliran berdasarkan currentState. Null jika state belum ada. */
  getCurrentPlayer(): string | null {
    return this.currentState?.currentPlayerId ?? null;
  }

  /** Return currentState. Throw jika belum diinisialisasi. */
  getState(): GameState {
    if (!this.currentState) {
      throw new Error('Game state belum diinisialisasi.');
    }
    return this.currentState;
  }
}
