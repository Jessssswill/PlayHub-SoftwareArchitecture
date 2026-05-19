import { GameEventEmitter } from '../src/business/domain/events/game-event-emitter';
import { GameStatus } from '../src/shared/types/game-status.enum';
import { GameState } from '../src/business/domain/games/game-state';
import { GameType } from '../src/shared/types/game-type.enum';

const makeState = (): GameState =>
  new GameState({
    boardState: [['', '', ''], ['', '', ''], ['', '', '']],
    currentPlayerId: 'p1',
    playerOrder: ['p1', 'p2'],
  });

describe('Observer — GameEventEmitter', () => {
  let emitter: GameEventEmitter;

  beforeEach(() => {
    emitter = new GameEventEmitter();
  });

  it('on() mendaftarkan listener, emit() memanggilnya dengan payload yang benar', () => {
    const received: unknown[] = [];
    emitter.on('player.joined', (p) => received.push(p));

    emitter.emit('player.joined', { player: { id: 'p1', name: 'Alice' } });

    expect(received).toHaveLength(1);
    expect((received[0] as { player: { name: string } }).player.name).toBe('Alice');
  });

  it('beberapa listener pada event yang sama semua terpanggil', () => {
    const calls: string[] = [];
    emitter.on('state.changed', () => calls.push('listener-1'));
    emitter.on('state.changed', () => calls.push('listener-2'));

    emitter.emit('state.changed', {
      from: GameStatus.WAITING,
      to: GameStatus.IN_PROGRESS,
    });

    expect(calls).toEqual(['listener-1', 'listener-2']);
  });

  it('off() menghapus listener — tidak terpanggil setelah di-remove', () => {
    const calls: number[] = [];
    const listener = () => calls.push(1);

    emitter.on('player.left', listener);
    emitter.emit('player.left', { playerId: 'p1' });
    emitter.off('player.left', listener);
    emitter.emit('player.left', { playerId: 'p1' });

    expect(calls).toHaveLength(1);
  });

  it('once() hanya terpanggil sekali', () => {
    const calls: number[] = [];
    emitter.once('game.finished', () => calls.push(1));

    emitter.emit('game.finished', { endResult: { isOver: true, winnerId: 'p1', isDraw: false } });
    emitter.emit('game.finished', { endResult: { isOver: true, winnerId: 'p1', isDraw: false } });

    expect(calls).toHaveLength(1);
  });

  it('emit move.applied meneruskan newState dan move dengan benar', () => {
    const state = makeState();
    const received: unknown[] = [];
    emitter.on('move.applied', (p) => received.push(p));

    emitter.emit('move.applied', {
      newState: state,
      move: { gameType: GameType.TIC_TAC_TOE, playerId: 'p1', row: 0, col: 0 },
      endResult: { isOver: false, winnerId: null, isDraw: false },
    });

    expect(received).toHaveLength(1);
    const payload = received[0] as { newState: GameState };
    expect(payload.newState).toBe(state);
  });

  it('listener tidak menerima event dari tipe yang berbeda', () => {
    const calls: number[] = [];
    emitter.on('player.joined', () => calls.push(1));

    emitter.emit('player.left', { playerId: 'p1' });

    expect(calls).toHaveLength(0);
  });

  it('removeAllListeners() menghapus semua listener untuk satu event', () => {
    const calls: number[] = [];
    emitter.on('player.left', () => calls.push(1));
    emitter.on('player.left', () => calls.push(2));

    emitter.removeAllListeners('player.left');
    emitter.emit('player.left', { playerId: 'p1' });

    expect(calls).toHaveLength(0);
  });
});
