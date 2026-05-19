import { EventEmitter } from 'events';
import { GameStatus } from '../../../shared/types/game-status.enum';
import { Player } from '../../../shared/types/player.interface';
import { Move, EndCondition } from '../../../shared/types/move.types';
import { GameState } from '../games/game-state';

/** Strongly-typed event map — setiap event key punya payload yang terdefinisi. */
interface GameEventPayloads {
  'move.applied': { newState: GameState; move: Move; endResult: EndCondition };
  'state.changed': { from: GameStatus; to: GameStatus };
  'player.joined': { player: Player };
  'game.finished': { endResult: EndCondition };
  'player.left': { playerId: string };
}

/**
 * @pattern Observer
 * @intent Decoupling antara game engine dan spectator/client: siapapun bisa
 *         subscribe ke event game tanpa game engine tahu siapa subscriber-nya.
 *         Satu instance per GameSession — event sudah terscope ke sesi itu.
 * @participants GameSession (subject), WebSocket Gateway (concrete observer),
 *               GameEngineFacade (emitter)
 */
export class GameEventEmitter {
  private readonly emitter = new EventEmitter();

  on<K extends keyof GameEventPayloads>(
    event: K,
    listener: (payload: GameEventPayloads[K]) => void,
  ): this {
    this.emitter.on(event, listener as (arg: unknown) => void);
    return this;
  }

  once<K extends keyof GameEventPayloads>(
    event: K,
    listener: (payload: GameEventPayloads[K]) => void,
  ): this {
    this.emitter.once(event, listener as (arg: unknown) => void);
    return this;
  }

  off<K extends keyof GameEventPayloads>(
    event: K,
    listener: (payload: GameEventPayloads[K]) => void,
  ): this {
    this.emitter.off(event, listener as (arg: unknown) => void);
    return this;
  }

  emit<K extends keyof GameEventPayloads>(event: K, payload: GameEventPayloads[K]): void {
    this.emitter.emit(event, payload);
  }

  removeAllListeners(event?: keyof GameEventPayloads): void {
    this.emitter.removeAllListeners(event);
  }
}
