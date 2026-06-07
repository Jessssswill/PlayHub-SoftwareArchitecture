import { GameType } from '../../shared/types/game-type.enum';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Player } from '../../shared/types/player.interface';
import { Move } from '../../shared/types/move.types';
import { GameState } from './games/game-state';
import { GameEventEmitter } from './events/game-event-emitter';
import { IGameLifecycleState } from './states/game-lifecycle-state.interface';
import { ISessionContext } from './states/session-context.interface';
import { WaitingForPlayersState } from './states/waiting-for-players.state';

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

  readonly emitter: GameEventEmitter;

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

  transitionTo(newState: IGameLifecycleState): void {
    const from = this.status;
    this.lifecycleState = newState;
    this.status = newState.getName();
    this.emitter.emit('state.changed', { from, to: this.status });
  }

  joinPlayer(player: Player): void {
    this.lifecycleState.joinPlayer(this, player);
  }

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

  getCurrentPlayer(): string | null {
    return this.currentState?.currentPlayerId ?? null;
  }

  getState(): GameState {
    if (!this.currentState) {
      throw new Error('Game state belum diinisialisasi.');
    }
    return this.currentState;
  }
}
