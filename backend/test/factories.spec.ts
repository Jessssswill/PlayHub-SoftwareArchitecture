import { TicTacToeFactory } from '../src/business/factories/tic-tac-toe.factory';
import { ChessFactory } from '../src/business/factories/chess.factory';
import { ConnectFourFactory } from '../src/business/factories/connect-four.factory';
import { GameFactoryProvider } from '../src/business/factories/game-factory.provider';
import { GameType } from '../src/shared/types/game-type.enum';

describe('Abstract Factory - IGameFactory', () => {
  const tttFactory = new TicTacToeFactory();
  const chessFactory = new ChessFactory();
  const c4Factory = new ConnectFourFactory();

  // ── TicTacToeFactory ──────────────────────────────────────────────────────

  describe('TicTacToeFactory', () => {
    it('createBoard() menghasilkan papan 3×3', () => {
      const board = tttFactory.createBoard();
      expect(board.width).toBe(3);
      expect(board.height).toBe(3);
      expect(board.cells).toHaveLength(3);
      board.cells.forEach((row) => expect(row).toHaveLength(3));
    });

    it('createBoard() semua cell kosong string', () => {
      const board = tttFactory.createBoard();
      board.cells.forEach((row) =>
        row.forEach((cell) => expect(cell).toBe('')),
      );
    });

    it('createRules() return TicTacToeRules', () => {
      const rules = tttFactory.createRules();
      expect(rules.name).toBe('TicTacToeRules');
    });

    it('createInitialState() currentPlayerId = player pertama', () => {
      const state = tttFactory.createInitialState(['p1', 'p2']);
      expect(state.currentPlayerId).toBe('p1');
      expect(state.moveCount).toBe(0);
    });
  });

  // ── ChessFactory ──────────────────────────────────────────────────────────

  describe('ChessFactory', () => {
    it('createBoard() menghasilkan papan 8×8', () => {
      const board = chessFactory.createBoard();
      expect(board.width).toBe(8);
      expect(board.height).toBe(8);
      expect(board.cells).toHaveLength(8);
      board.cells.forEach((row) => expect(row).toHaveLength(8));
    });

    it('createBoard() baris 0 = back rank hitam', () => {
      const board = chessFactory.createBoard();
      expect(board.cells[0]).toEqual(['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']);
    });

    it('createBoard() baris 1 = pion hitam semua', () => {
      const board = chessFactory.createBoard();
      board.cells[1].forEach((cell) => expect(cell).toBe('p'));
    });

    it('createBoard() baris 6 = pion putih semua', () => {
      const board = chessFactory.createBoard();
      board.cells[6].forEach((cell) => expect(cell).toBe('P'));
    });

    it('createBoard() baris 7 = back rank putih', () => {
      const board = chessFactory.createBoard();
      expect(board.cells[7]).toEqual(['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']);
    });

    it('createRules() return ChessRules', () => {
      const rules = chessFactory.createRules();
      expect(rules.name).toBe('ChessRules');
    });

    it('createInitialState() currentPlayerId = player pertama (putih)', () => {
      const state = chessFactory.createInitialState(['white-player', 'black-player']);
      expect(state.currentPlayerId).toBe('white-player');
    });
  });

  // ── ConnectFourFactory ────────────────────────────────────────────────────

  describe('ConnectFourFactory', () => {
    it('createBoard() menghasilkan papan 6×7', () => {
      const board = c4Factory.createBoard();
      expect(board.width).toBe(7);
      expect(board.height).toBe(6);
      expect(board.cells).toHaveLength(6);
      board.cells.forEach((row) => expect(row).toHaveLength(7));
    });

    it('createRules() return ConnectFourRules', () => {
      const rules = c4Factory.createRules();
      expect(rules.name).toBe('ConnectFourRules');
    });

    it('createInitialState() currentPlayerId = player pertama', () => {
      const state = c4Factory.createInitialState(['p1', 'p2']);
      expect(state.currentPlayerId).toBe('p1');
    });
  });

  // ── GameFactoryProvider ───────────────────────────────────────────────────

  describe('GameFactoryProvider', () => {
    const provider = new GameFactoryProvider(tttFactory, chessFactory, c4Factory);

    it('getFactory(TIC_TAC_TOE) return TicTacToeFactory', () => {
      const factory = provider.getFactory(GameType.TIC_TAC_TOE);
      expect(factory.createBoard().width).toBe(3);
    });

    it('getFactory(CHESS) return ChessFactory', () => {
      const factory = provider.getFactory(GameType.CHESS);
      expect(factory.createBoard().width).toBe(8);
    });

    it('getFactory(CONNECT_FOUR) return ConnectFourFactory', () => {
      const factory = provider.getFactory(GameType.CONNECT_FOUR);
      expect(factory.createBoard().width).toBe(7);
    });

    it('getFactory() dengan type tidak dikenal throw NotFoundException', () => {
      expect(() =>
        provider.getFactory('POKER' as GameType),
      ).toThrow();
    });
  });
});
