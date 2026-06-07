import { TicTacToeGame } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.game';
import { GameState } from '../src/business/domain/games/game-state';
import { GameEventEmitter } from '../src/business/domain/events/game-event-emitter';
import { GameType } from '../src/shared/types/game-type.enum';
import { TicTacToeMove, EndCondition } from '../src/shared/types/move.types';

const makeState = (): GameState =>
  new GameState({
    boardState: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
    currentPlayerId: 'p1',
    playerOrder: ['p1', 'p2'],
  });

const validMove: TicTacToeMove = {
  gameType: GameType.TIC_TAC_TOE,
  playerId: 'p1',
  row: 0,
  col: 0,
};

describe('Template Method - Game.executeTurn()', () => {
  let game: TicTacToeGame;
  let emitter: GameEventEmitter;

  beforeEach(() => {
    game = new TicTacToeGame();
    emitter = new GameEventEmitter();
  });

  it('executeTurn() memanggil validateMove, applyMove, checkEndCondition berurutan', () => {
    const callOrder: string[] = [];

    jest.spyOn(game as any, 'validateMove').mockImplementation(() => {
      callOrder.push('validate');
    });
    jest.spyOn(game as any, 'applyMove').mockImplementation(() => {
      callOrder.push('apply');
      return makeState();
    });
    jest.spyOn(game as any, 'checkEndCondition').mockImplementation(() => {
      callOrder.push('check');
      return { isOver: false, winnerId: null, isDraw: false } as EndCondition;
    });

    game.executeTurn(makeState(), validMove, emitter);

    expect(callOrder).toEqual(['validate', 'apply', 'check']);
  });

  it('executeTurn() emit move.applied setelah semua hook selesai', () => {
    const received: unknown[] = [];
    emitter.on('move.applied', (payload) => received.push(payload));

    const result = game.executeTurn(makeState(), validMove, emitter);

    expect(received).toHaveLength(1);
    expect(result.newState).toBeDefined();
    expect(result.endResult).toBeDefined();
  });

  it('executeTurn() emit game.finished jika endResult.isOver = true', () => {
    const finished: unknown[] = [];
    emitter.on('game.finished', (p) => finished.push(p));

    // Buat state menang dengan baris penuh X
    const winState = new GameState({
      boardState: [
        ['X', 'X', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      currentPlayerId: 'p1',
      playerOrder: ['p1', 'p2'],
    });
    const winMove: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: 'p1',
      row: 0,
      col: 2,
    };

    game.executeTurn(winState, winMove, emitter);

    expect(finished).toHaveLength(1);
  });

  it('executeTurn() tidak emit game.finished jika game belum selesai', () => {
    const finished: unknown[] = [];
    emitter.on('game.finished', (p) => finished.push(p));

    game.executeTurn(makeState(), validMove, emitter);

    expect(finished).toHaveLength(0);
  });

  it('executeTurn() melempar jika validateMove gagal - applyMove tidak dipanggil', () => {
    const invalidMove: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: 'p2', // bukan giliran p2
      row: 0,
      col: 0,
    };
    const applySpy = jest.spyOn(game as any, 'applyMove');

    expect(() => game.executeTurn(makeState(), invalidMove, emitter)).toThrow();
    expect(applySpy).not.toHaveBeenCalled();
  });

  it('getType() mengembalikan TIC_TAC_TOE', () => {
    expect(game.getType()).toBe(GameType.TIC_TAC_TOE);
  });
});
