import { Board } from '../domain/games/board.interface';
import { GameState } from '../domain/games/game-state';

export interface GameRules {
  readonly name: string;
}

export interface IGameFactory {
  createBoard(): Board<string>;
  createRules(): GameRules;
  createInitialState(playerIds: [string, string]): GameState;
}
