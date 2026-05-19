import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Player } from '../../shared/types/player.interface';
import { Move, EndCondition } from '../../shared/types/move.types';
import { GameState } from '../domain/games/game-state';

/** Payload tiap event di global bus — selalu menyertakan sessionId untuk room routing. */
export interface BusPayloads {
  'move.applied': { sessionId: string; newState: GameState; move: Move; endResult: EndCondition };
  'state.changed': { sessionId: string; from: GameStatus; to: GameStatus };
  'player.joined': { sessionId: string; player: Player };
  'game.finished': { sessionId: string; endResult: EndCondition };
}

/**
 * @pattern Observer (Global Bus)
 * @intent Meneruskan event per-session ke subscriber global (WebSocket Gateway)
 *         dengan sessionId di setiap payload untuk routing ke room yang tepat.
 *         Singleton NestJS DI — satu bus untuk seluruh aplikasi.
 * @participants GameEngineFacade (publisher), GameGateway (subscriber)
 */
@Injectable()
export class GameEventBus {
  private readonly emitter = new EventEmitter();

  on<K extends keyof BusPayloads>(
    event: K,
    listener: (payload: BusPayloads[K]) => void,
  ): this {
    this.emitter.on(event, listener as (arg: unknown) => void);
    return this;
  }

  emit<K extends keyof BusPayloads>(event: K, payload: BusPayloads[K]): void {
    this.emitter.emit(event, payload);
  }
}
