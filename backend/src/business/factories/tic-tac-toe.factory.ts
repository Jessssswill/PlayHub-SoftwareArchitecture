import { Injectable } from '@nestjs/common';
import { Board } from '../domain/games/board.interface';
import { GameState } from '../domain/games/game-state';
import { IGameFactory, GameRules } from './game-factory.interface';

class TicTacToeRules implements GameRules {
  readonly name = 'TicTacToeRules';
}

@Injectable()
export class TicTacToeFactory implements IGameFactory {
  createBoard(): Board<string> {
    return {
      width: 3,
      height: 3,
      cells: Array.from({ length: 3 }, () => Array(3).fill('')),
    };
  }

  createRules(): GameRules {
    return new TicTacToeRules();
  }

  createInitialState(playerIds: [string, string]): GameState {
    const board = this.createBoard();
    return new GameState({
      boardState: board.cells,
      currentPlayerId: playerIds[0],
      playerOrder: [playerIds[0], playerIds[1]],
    });
  }
}
