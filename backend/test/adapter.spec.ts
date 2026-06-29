import { RandomAiAdapter } from '../src/infrastructure/adapters/random-ai.adapter';
import { MinimaxAiAdapter } from '../src/infrastructure/adapters/minimax-ai.adapter';
import { ExternalEngineAdapter } from '../src/infrastructure/adapters/external-engine.adapter';
import { GameState } from '../src/business/domain/games/game-state';
import { GameType } from '../src/shared/types/game-type.enum';
import { TicTacToeMove, ChessMove } from '../src/shared/types/move.types';

const makeTttState = (board?: string[][]): GameState =>
  new GameState({
    boardState: board ?? [['', '', ''], ['', '', ''], ['', '', '']],
    currentPlayerId: 'p1',
    playerOrder: ['p1', 'p2'],
  });

const makeChessState = (): GameState => {
  const cells: string[][] = Array.from({ length: 8 }, () => Array(8).fill(''));
  // Row 0 (Rank 8) - Black back rank
  cells[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  // Row 1 (Rank 7) - Black pawns
  cells[1] = Array(8).fill('p');
  // Row 6 (Rank 2) - White pawns
  cells[6] = Array(8).fill('P');
  // Row 7 (Rank 1) - White back rank
  cells[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  return new GameState({ boardState: cells, currentPlayerId: 'white', playerOrder: ['white', 'black'] });
};

describe('Adapter - AI Engines', () => {
  // ── RandomAiAdapter ───────────────────────────────────────────────────────

  describe('RandomAiAdapter', () => {
    const adapter = new RandomAiAdapter();

    it('TicTacToe: mengembalikan move dengan gameType yang benar', async () => {
      const move = await adapter.getNextMove(makeTttState(), GameType.TIC_TAC_TOE);
      expect(move.gameType).toBe(GameType.TIC_TAC_TOE);
    });

    it('TicTacToe: playerId sesuai currentPlayerId', async () => {
      const move = await adapter.getNextMove(makeTttState(), GameType.TIC_TAC_TOE) as TicTacToeMove;
      expect(move.playerId).toBe('p1');
    });

    it('TicTacToe: move berada di cell kosong', async () => {
      const state = makeTttState();
      const move = await adapter.getNextMove(state, GameType.TIC_TAC_TOE) as TicTacToeMove;
      expect(state.boardState[move.row][move.col]).toBe('');
    });

    it('TicTacToe: throw ketika semua cell terisi', async () => {
      const fullBoard = [
        ['X', 'O', 'X'],
        ['X', 'O', 'O'],
        ['O', 'X', 'X'],
      ];
      await expect(
        adapter.getNextMove(makeTttState(fullBoard), GameType.TIC_TAC_TOE),
      ).rejects.toThrow('cell kosong');
    });

    it('Chess: mengembalikan move dengan gameType CHESS', async () => {
      const move = await adapter.getNextMove(makeChessState(), GameType.CHESS);
      expect(move.gameType).toBe(GameType.CHESS);
    });

    it('Chess: move valid dari posisi awal (ada banyak pilihan)', async () => {
      const move = await adapter.getNextMove(makeChessState(), GameType.CHESS) as ChessMove;
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();
    });
  });

  // ── MinimaxAiAdapter ──────────────────────────────────────────────────────

  describe('MinimaxAiAdapter', () => {
    const adapter = new MinimaxAiAdapter();

    it('TicTacToe: mengembalikan move optimal (blok menang lawan)', async () => {
      // Posisi valid: X:2 pieces [0,2][2,0], O:2 pieces [1,0][1,1] - 4 moves total, giliran X.
      // O mengancam row 1 ([1,0][1,1] → butuh [1,2]).
      // X tidak punya kemenangan langsung - satu-satunya move tidak kalah adalah blok di (1,2).
      const state = new GameState({
        boardState: [
          ['', '', 'X'],
          ['O', 'O', ''],
          ['X', '', ''],
        ],
        currentPlayerId: 'p1', // p1 = X (playerOrder[0])
        playerOrder: ['p1', 'p2'],
      });
      const move = await adapter.getNextMove(state, GameType.TIC_TAC_TOE) as TicTacToeMove;
      expect(move.row).toBe(1);
      expect(move.col).toBe(2);
    });

    it('TicTacToe: memilih kemenangan langsung', async () => {
      // X bisa menang di [0,2]
      const state = new GameState({
        boardState: [
          ['X', 'X', ''],
          ['O', 'O', ''],
          ['', '', ''],
        ],
        currentPlayerId: 'p1',
        playerOrder: ['p1', 'p2'],
      });
      const move = await adapter.getNextMove(state, GameType.TIC_TAC_TOE) as TicTacToeMove;
      expect(move.row).toBe(0);
      expect(move.col).toBe(2);
    });

    it('TicTacToe: mengembalikan move valid di papan kosong', async () => {
      // Pada papan kosong, semua move menghasilkan draw (score 0) dengan optimal play.
      // Minimax mengembalikan cell pertama yang dievaluasi - yang penting move valid.
      const move = await adapter.getNextMove(makeTttState(), GameType.TIC_TAC_TOE) as TicTacToeMove;
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThanOrEqual(2);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThanOrEqual(2);
    });

    it('Chess: throw NotImplementedException', async () => {
      await expect(
        adapter.getNextMove(makeChessState(), GameType.CHESS),
      ).rejects.toThrow();
    });
  });

  // ── ExternalEngineAdapter ─────────────────────────────────────────────────

  describe('ExternalEngineAdapter', () => {
    const adapter = new ExternalEngineAdapter();

    it('Chess: mengembalikan move setelah fake delay', async () => {
      const start = Date.now();
      const move = await adapter.getNextMove(makeChessState(), GameType.CHESS) as ChessMove;
      const elapsed = Date.now() - start;

      expect(move.gameType).toBe(GameType.CHESS);
      expect(elapsed).toBeGreaterThanOrEqual(90); // ~100ms delay
    }, 500);

    it('Chess: stub move dari e2 ke e4', async () => {
      const move = await adapter.getNextMove(makeChessState(), GameType.CHESS) as ChessMove;
      expect(move.from).toEqual({ row: 6, col: 4 });
      expect(move.to).toEqual({ row: 4, col: 4 });
    }, 500);
  });
});
