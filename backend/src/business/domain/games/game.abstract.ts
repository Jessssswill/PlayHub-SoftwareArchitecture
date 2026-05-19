import { GameType } from '../../../shared/types/game-type.enum';
import { Move, EndCondition } from '../../../shared/types/move.types';
import { GameState } from './game-state';
import { GameEventEmitter } from '../events/game-event-emitter';

export interface TurnResult {
  newState: GameState;
  endResult: EndCondition;
}

/**
 * @pattern Template Method
 * @intent Mendefinisikan skeleton satu giliran: validate → apply → checkEnd → emit.
 *         Urutan langkah tidak boleh diubah subclass; hanya isi tiap langkah yang
 *         bervariasi per game type (Chess vs TicTacToe).
 * @participants TicTacToeGame, ChessGame (ConcreteClass), GameEngineFacade (caller)
 */
export abstract class Game {
  /**
   * Template method — JANGAN di-override di subclass.
   * Urutan: validateMove → applyMove → checkEndCondition → emit move.applied.
   */
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

  /**
   * Cek apakah move legal tanpa melempar exception.
   * Digunakan MoveValidationService untuk early rejection dengan pesan ramah.
   */
  isValidMove(state: GameState, move: Move): boolean {
    try {
      this.validateMove(state, move);
      return true;
    } catch {
      return false;
    }
  }

  /** Lempar BadRequestException jika move tidak valid — tidak return apapun. */
  protected abstract validateMove(state: GameState, move: Move): void;

  /** Terapkan move, return immutable-style GameState baru. */
  protected abstract applyMove(state: GameState, move: Move): GameState;

  /** Return EndCondition setiap saat; isOver:false jika game belum selesai. */
  protected abstract checkEndCondition(state: GameState): EndCondition;

  abstract getType(): GameType;
}
