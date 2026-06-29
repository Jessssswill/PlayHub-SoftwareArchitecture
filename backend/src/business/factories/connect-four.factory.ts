import { Injectable } from '@nestjs/common';
import { IGameFactory, GameRules } from './game-factory.interface';
import { ConnectFourRules } from '../domain/games/connect-four/connect-four.rules';
import { GameState } from '../domain/games/game-state';
import { Board } from '../domain/games/board.interface';

class ConnectFourRulesStub implements GameRules {
  readonly name = 'ConnectFourRules';
}

@Injectable()
export class ConnectFourFactory implements IGameFactory {
  createBoard(): Board<string> {
    return {
      width: ConnectFourRules.COLS,
      height: ConnectFourRules.ROWS,
      cells: Array.from({ length: ConnectFourRules.ROWS }, () =>
        Array(ConnectFourRules.COLS).fill(''),
      ),
    };
  }

  createRules(): GameRules {
    return new ConnectFourRulesStub();
  }

  createInitialState(playerIds: [string, string]): GameState {
    const board = this.createBoard();
    return new GameState({
      boardState: board.cells,
      currentPlayerId: playerIds[0],
      playerOrder: [...playerIds],
    });
  }
}
