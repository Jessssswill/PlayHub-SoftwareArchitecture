import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Player } from '../../shared/types/player.interface';
import { Move, EndCondition } from '../../shared/types/move.types';
import { GameState } from '../domain/games/game-state';

export interface BusPayloads {
  'move.applied': { sessionId: string; newState: GameState; move: Move; endResult: EndCondition };
  'state.changed': { sessionId: string; from: GameStatus; to: GameStatus };
  'player.joined': { sessionId: string; player: Player };
  'game.finished': { sessionId: string; endResult: EndCondition };
}

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
