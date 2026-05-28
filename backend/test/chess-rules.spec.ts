import { BadRequestException } from '@nestjs/common';
import { ChessRules } from '../src/business/domain/games/chess/chess.rules';
import { GameState } from '../src/business/domain/games/game-state';
import { ChessMove } from '../src/shared/types/move.types';
import { GameType } from '../src/shared/types/game-type.enum';

const P1 = 'white-player';
const P2 = 'black-player';

const makeEmptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(''));

const makeState = (board: string[][], turn: string = P1): GameState =>
  new GameState({
    boardState: board,
    currentPlayerId: turn,
    playerOrder: [P1, P2],
  });

describe('ChessRules', () => {
  describe('Pawn', () => {
    it('White pawn moves forward 1 step', () => {
      const board = makeEmptyBoard();
      board[6][0] = 'P';
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 6, col: 0 },
        to: { row: 5, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).not.toThrow();
    });

    it('White pawn moves forward 2 steps from startRow', () => {
      const board = makeEmptyBoard();
      board[6][0] = 'P';
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 6, col: 0 },
        to: { row: 4, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).not.toThrow();
    });

    it('Black pawn moves forward 1 step', () => {
      const board = makeEmptyBoard();
      board[1][0] = 'p';
      const state = makeState(board, P2);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P2,
        from: { row: 1, col: 0 },
        to: { row: 2, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).not.toThrow();
    });

    it('Pawn cannot move sideways without capture', () => {
      const board = makeEmptyBoard();
      board[6][1] = 'P';
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 6, col: 1 },
        to: { row: 5, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).toThrow(BadRequestException);
    });

    it('Pawn captures diagonally', () => {
      const board = makeEmptyBoard();
      board[6][1] = 'P';
      board[5][0] = 'r'; // enemy piece
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 6, col: 1 },
        to: { row: 5, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).not.toThrow();
    });
  });

  describe('Rook', () => {
    it('moves horizontally', () => {
      const board = makeEmptyBoard();
      board[4][4] = 'R';
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 4, col: 4 },
        to: { row: 4, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).not.toThrow();
    });

    it('cannot move through pieces', () => {
      const board = makeEmptyBoard();
      board[4][4] = 'R';
      board[4][2] = 'P';
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 4, col: 4 },
        to: { row: 4, col: 0 },
      };
      expect(() => ChessRules.validate(state, move)).toThrow(BadRequestException);
    });
  });

  describe('Knight', () => {
    it('moves in L-shape', () => {
      const board = makeEmptyBoard();
      board[4][4] = 'N';
      const state = makeState(board);
      const move: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 4, col: 4 },
        to: { row: 6, col: 5 },
      };
      expect(() => ChessRules.validate(state, move)).not.toThrow();
    });
  });

  describe('Game End', () => {
    it('is over if white king is missing', () => {
      const board = makeEmptyBoard();
      board[0][0] = 'k';
      const state = makeState(board);
      const end = ChessRules.checkEnd(state);
      expect(end.isOver).toBe(true);
      expect(end.winnerId).toBe(P2);
    });
  });

  describe('Turn Order', () => {
    it('White (P1) must move first', () => {
      const board = makeEmptyBoard();
      board[6][0] = 'P';
      board[1][0] = 'p';
      const state = makeState(board, P1);
      
      const blackMove: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P2,
        from: { row: 1, col: 0 },
        to: { row: 2, col: 0 },
      };
      expect(() => ChessRules.validate(state, blackMove)).toThrow(/Bukan giliran/);
    });

    it('White player cannot move black pieces', () => {
      const board = makeEmptyBoard();
      board[6][0] = 'P';
      board[1][0] = 'p';
      const state = makeState(board, P1);
      
      const illegalMove: ChessMove = {
        gameType: GameType.CHESS,
        playerId: P1,
        from: { row: 1, col: 0 },
        to: { row: 2, col: 0 },
      };
      expect(() => ChessRules.validate(state, illegalMove)).toThrow(/piece lawan/);
    });
  });
});
