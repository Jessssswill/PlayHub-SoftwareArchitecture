import { GameType } from '../../../shared/types/game-type.enum';
import { Move, EndCondition } from '../../../shared/types/move.types';
import { GameState } from './game-state';
import { GameEventEmitter } from '../events/game-event-emitter';

export interface TurnResult {
  newState: GameState;
  endResult: EndCondition;
}

export abstract class Game {
  executeTurn(state: GameState, move: Move, emitter: GameEventEmitter): TurnResult {
    this.validateMove(state, move);
    const newState = this.applyMove(state, move);
    const endResult = this.checkEndCondition(newState);
    emitter.emit('move.applied', { newState, move, endResult });
    if (endResult.isOver) {
      emitter.emit('game.finished', { endResult });
    }
    return { newState, endResult };
  }

  isValidMove(state: GameState, move: Move): boolean {
    try {
      this.validateMove(state, move);
      return true;
    } catch {
      return false;
    }
  }

  protected abstract validateMove(state: GameState, move: Move): void;

  protected abstract applyMove(state: GameState, move: Move): GameState;

  protected abstract checkEndCondition(state: GameState): EndCondition;

  abstract getType(): GameType;
}
