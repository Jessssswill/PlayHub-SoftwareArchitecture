import { Injectable } from '@nestjs/common';
import { Board } from '../domain/games/board.interface';
import { GameState } from '../domain/games/game-state';
import { IGameFactory, GameRules } from './game-factory.interface';

class TicTacToeRules implements GameRules {
  readonly name = 'TicTacToeRules';
}

/**
 * @pattern Abstract Factory (ConcreteFactory)
 * @intent Membuat set komponen TicTacToe: papan 3×3 kosong, rules dasar,
 *         dan initial state dengan player pertama sebagai giliran pertama.
 * @participants IGameFactory (AbstractFactory), TicTacToeRules, Board, GameState
 */
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
