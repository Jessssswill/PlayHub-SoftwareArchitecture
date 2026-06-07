import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Game } from '../game.abstract';
import { GameState } from '../game-state';
import { GameType } from '../../../../shared/types/game-type.enum';
import { Move, EndCondition, TicTacToeMove } from '../../../../shared/types/move.types';
import { TicTacToeRules } from './tic-tac-toe.rules';

@Injectable()
export class TicTacToeGame extends Game {
  getType(): GameType {
    return GameType.TIC_TAC_TOE;
  }

  protected validateMove(state: GameState, move: Move): void {
    if (move.gameType !== GameType.TIC_TAC_TOE) {
      throw new BadRequestException('Move type tidak sesuai untuk TicTacToe.');
    }
    TicTacToeRules.validate(state, move as TicTacToeMove);
  }

  protected applyMove(state: GameState, move: Move): GameState {
    return TicTacToeRules.apply(state, move as TicTacToeMove);
  }

  protected checkEndCondition(state: GameState): EndCondition {
    return TicTacToeRules.checkEnd(state);
  }
}
