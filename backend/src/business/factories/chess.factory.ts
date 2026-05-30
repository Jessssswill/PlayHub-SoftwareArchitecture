import { Injectable } from '@nestjs/common';
import { Board } from '../domain/games/board.interface';
import { GameState } from '../domain/games/game-state';
import { IGameFactory, GameRules } from './game-factory.interface';

class ChessRules implements GameRules {
  readonly name = 'ChessRules';
}

const BACK_RANK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

/**
 * @pattern Abstract Factory (ConcreteFactory)
 * @intent Membuat set komponen Chess: papan 8×8 dengan posisi awal standar,
 *         rules catur (stub), dan initial state dengan giliran pertama ke putih.
 * @participants IGameFactory (AbstractFactory), ChessRules, Board, GameState
 */
@Injectable()
export class ChessFactory implements IGameFactory {
  createBoard(): Board<string> {
    const cells: string[][] = Array.from({ length: 8 }, () => Array(8).fill(''));
    // Row 0 (Rank 8) - Black back rank
    cells[0] = BACK_RANK.map((p) => p.toLowerCase());
    // Row 1 (Rank 7) - Black pawns
    cells[1] = Array(8).fill('p');
    // Row 6 (Rank 2) - White pawns
    cells[6] = Array(8).fill('P');
    // Row 7 (Rank 1) - White back rank
    cells[7] = [...BACK_RANK];
    return { width: 8, height: 8, cells };
  }

  createRules(): GameRules {
    return new ChessRules();
  }

  createInitialState(playerIds: [string, string]): GameState {
    const board = this.createBoard();
    return new GameState({
      boardState: board.cells,
      currentPlayerId: playerIds[0],
      capturedPieces: [],
      playerOrder: [playerIds[0], playerIds[1]],
    });
  }
}
