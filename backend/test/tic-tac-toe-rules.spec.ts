import { TicTacToeRules } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.rules';
import { GameState } from '../src/business/domain/games/game-state';
import { GameType } from '../src/shared/types/game-type.enum';
import { TicTacToeMove } from '../src/shared/types/move.types';

const makeEmptyState = (): GameState =>
  new GameState({
    boardState: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
    currentPlayerId: 'p1',
    playerOrder: ['p1', 'p2'],
  });

const move = (row: number, col: number, playerId = 'p1'): TicTacToeMove => ({
  gameType: GameType.TIC_TAC_TOE,
  playerId,
  row,
  col,
});

describe('TicTacToe Rules', () => {
  // ── Validasi ─────────────────────────────────────────────────────────────

  describe('validate()', () => {
    it('move valid tidak melempar', () => {
      const state = makeEmptyState();
      expect(() => TicTacToeRules.validate(state, move(1, 1))).not.toThrow();
    });

    it('row < 0 melempar BadRequestException', () => {
      expect(() =>
        TicTacToeRules.validate(makeEmptyState(), move(-1, 0)),
      ).toThrow('di luar papan');
    });

    it('row > 2 melempar BadRequestException', () => {
      expect(() =>
        TicTacToeRules.validate(makeEmptyState(), move(3, 0)),
      ).toThrow('di luar papan');
    });

    it('col < 0 melempar', () => {
      expect(() =>
        TicTacToeRules.validate(makeEmptyState(), move(0, -1)),
      ).toThrow('di luar papan');
    });

    it('col > 2 melempar', () => {
      expect(() =>
        TicTacToeRules.validate(makeEmptyState(), move(0, 3)),
      ).toThrow('di luar papan');
    });

    it('cell yang sudah terisi melempar', () => {
      const state = makeEmptyState();
      state.boardState[0][0] = 'X';
      expect(() =>
        TicTacToeRules.validate(state, move(0, 0)),
      ).toThrow('sudah terisi');
    });

    it('player yang bukan gilirannya melempar', () => {
      const state = makeEmptyState(); // giliran p1
      expect(() =>
        TicTacToeRules.validate(state, move(0, 0, 'p2')),
      ).toThrow('Bukan giliran');
    });
  });

  // ── Apply ─────────────────────────────────────────────────────────────────

  describe('apply()', () => {
    it('cell ter-mark dengan simbol yang benar (X untuk p1)', () => {
      const state = makeEmptyState();
      const newState = TicTacToeRules.apply(state, move(1, 1));
      expect(newState.boardState[1][1]).toBe('X');
    });

    it('cell ter-mark dengan O untuk p2', () => {
      const state = new GameState({
        boardState: [['X', '', ''], ['', '', ''], ['', '', '']],
        currentPlayerId: 'p2',
        playerOrder: ['p1', 'p2'],
      });
      const newState = TicTacToeRules.apply(state, move(0, 1, 'p2'));
      expect(newState.boardState[0][1]).toBe('O');
    });

    it('giliran berpindah ke player berikutnya setelah apply', () => {
      const state = makeEmptyState();
      const newState = TicTacToeRules.apply(state, move(0, 0));
      expect(newState.currentPlayerId).toBe('p2');
    });

    it('moveCount bertambah 1', () => {
      const state = makeEmptyState();
      const newState = TicTacToeRules.apply(state, move(0, 0));
      expect(newState.moveCount).toBe(1);
    });

    it('state asli tidak termutasi (immutable-style)', () => {
      const state = makeEmptyState();
      TicTacToeRules.apply(state, move(0, 0));
      expect(state.boardState[0][0]).toBe('');
      expect(state.currentPlayerId).toBe('p1');
    });
  });

  // ── Deteksi menang ────────────────────────────────────────────────────────

  describe('checkEnd() - win detection', () => {
    it('mendeteksi menang pada baris horizontal', () => {
      const state = new GameState({
        boardState: [
          ['X', 'X', 'X'],
          ['O', 'O', ''],
          ['', '', ''],
        ],
        currentPlayerId: 'p2',
        playerOrder: ['p1', 'p2'],
      });
      const result = TicTacToeRules.checkEnd(state);
      expect(result.isOver).toBe(true);
      expect(result.winnerId).toBe('p1');
      expect(result.isDraw).toBe(false);
    });

    it('mendeteksi menang pada kolom vertikal', () => {
      const state = new GameState({
        boardState: [
          ['O', 'X', ''],
          ['O', 'X', ''],
          ['O', '', ''],
        ],
        currentPlayerId: 'p1',
        playerOrder: ['p1', 'p2'],
      });
      const result = TicTacToeRules.checkEnd(state);
      expect(result.isOver).toBe(true);
      expect(result.winnerId).toBe('p2');
    });

    it('mendeteksi menang pada diagonal utama', () => {
      const state = new GameState({
        boardState: [
          ['X', 'O', ''],
          ['O', 'X', ''],
          ['', '', 'X'],
        ],
        currentPlayerId: 'p2',
        playerOrder: ['p1', 'p2'],
      });
      const result = TicTacToeRules.checkEnd(state);
      expect(result.isOver).toBe(true);
      expect(result.winnerId).toBe('p1');
    });

    it('mendeteksi menang pada diagonal anti', () => {
      const state = new GameState({
        boardState: [
          ['O', 'X', 'X'],
          ['X', 'O', ''],
          ['X', '', 'O'],
        ],
        currentPlayerId: 'p1',
        playerOrder: ['p1', 'p2'],
      });
      const result = TicTacToeRules.checkEnd(state);
      expect(result.isOver).toBe(true);
      expect(result.winnerId).toBe('p2');
    });

    it('mendeteksi draw jika papan penuh tanpa pemenang', () => {
      const state = new GameState({
        boardState: [
          ['X', 'O', 'X'],
          ['X', 'X', 'O'],
          ['O', 'X', 'O'],
        ],
        currentPlayerId: 'p1',
        playerOrder: ['p1', 'p2'],
      });
      const result = TicTacToeRules.checkEnd(state);
      expect(result.isOver).toBe(true);
      expect(result.isDraw).toBe(true);
      expect(result.winnerId).toBeNull();
    });

    it('game belum selesai pada papan kosong', () => {
      const result = TicTacToeRules.checkEnd(makeEmptyState());
      expect(result.isOver).toBe(false);
    });

    it('game belum selesai jika ada cell kosong dan belum 3-in-a-row', () => {
      const state = new GameState({
        boardState: [
          ['X', 'O', ''],
          ['O', 'X', ''],
          ['', '', ''],
        ],
        currentPlayerId: 'p2',
        playerOrder: ['p1', 'p2'],
      });
      expect(TicTacToeRules.checkEnd(state).isOver).toBe(false);
    });
  });

  // ── Helper ────────────────────────────────────────────────────────────────

  describe('getSymbol()', () => {
    it('playerOrder[0] mendapat simbol X', () => {
      const state = makeEmptyState();
      expect(TicTacToeRules.getSymbol(state, 'p1')).toBe('X');
    });

    it('playerOrder[1] mendapat simbol O', () => {
      const state = makeEmptyState();
      expect(TicTacToeRules.getSymbol(state, 'p2')).toBe('O');
    });
  });
});
