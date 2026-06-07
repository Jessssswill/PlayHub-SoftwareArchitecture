import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Game } from '../game.abstract';
import { GameState } from '../game-state';
import { GameType } from '../../../../shared/types/game-type.enum';
import { Move, EndCondition, ChessMove } from '../../../../shared/types/move.types';
import { ChessRules } from './chess.rules';

@Injectable()
export class ChessGame extends Game {
  getType(): GameType {
    return GameType.CHESS;
  }

  protected validateMove(state: GameState, move: Move): void {
    if (move.gameType !== GameType.CHESS) {
      throw new BadRequestException('Move type tidak sesuai untuk Chess.');
    }
    ChessRules.validate(state, move as ChessMove);
  }

  protected applyMove(state: GameState, move: Move): GameState {
    return ChessRules.apply(state, move as ChessMove);
  }

  protected checkEndCondition(state: GameState): EndCondition {
    return ChessRules.checkEnd(state);
  }
}
