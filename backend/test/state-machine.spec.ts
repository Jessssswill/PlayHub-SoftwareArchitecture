import { GameSessionBuilder } from '../src/business/builders/game-session.builder';
import { GameSession } from '../src/business/domain/game-session';
import { GameStatus } from '../src/shared/types/game-status.enum';
import { GameType } from '../src/shared/types/game-type.enum';
import { Player } from '../src/shared/types/player.interface';
import { TicTacToeMove } from '../src/shared/types/move.types';

const p1: Player = { id: 'p1', name: 'Alice' };
const p2: Player = { id: 'p2', name: 'Bob' };

const dummyMove: TicTacToeMove = {
  gameType: GameType.TIC_TAC_TOE,
  playerId: 'p1',
  row: 0,
  col: 0,
};

const buildSession = (): GameSession =>
  new GameSessionBuilder()
    .forGame(GameType.TIC_TAC_TOE)
    .addPlayer(p1)
    .addPlayer(p2)
    .build();

describe('State Pattern — Game Lifecycle State Machine', () => {
  // ── Initial state ────────────────────────────────────────────────────────

  it('session baru selalu dimulai dalam status WAITING', () => {
    const session = buildSession();
    expect(session.status).toBe(GameStatus.WAITING);
  });

  // ── WAITING state ────────────────────────────────────────────────────────

  it('WAITING: canAcceptMove melempar BadRequestException', () => {
    const session = buildSession();
    expect(() => session.canAcceptMove(dummyMove)).toThrow('belum mulai');
  });

  it('WAITING: pause melempar', () => {
    const session = buildSession();
    expect(() => session.pause()).toThrow();
  });

  it('WAITING: resume melempar', () => {
    const session = buildSession();
    expect(() => session.resume()).toThrow();
  });

  it('WAITING: startGame() dengan 2 player → IN_PROGRESS', () => {
    const session = buildSession();
    session.startGame();
    expect(session.status).toBe(GameStatus.IN_PROGRESS);
  });

  it('WAITING: startGame() dengan < 2 player melempar BadRequestException', () => {
    const session = new GameSession({
      id: 'test',
      gameType: GameType.TIC_TAC_TOE,
      players: [p1],
      status: GameStatus.WAITING,
      currentState: null,
      createdAt: new Date(),
      timeControlSeconds: 0,
      isPrivate: false,
      allowSpectators: false,
      maxSpectators: 0,
    });
    expect(() => session.startGame()).toThrow('Minimal 2 player');
  });

  it('WAITING: joinPlayer() menambah player dan emit player.joined', () => {
    const session = buildSession();
    const joined: unknown[] = [];
    session.emitter.on('player.joined', (p) => joined.push(p));

    const p3: Player = { id: 'p3', name: 'Charlie' };
    session.joinPlayer(p3);

    expect(session.players).toHaveLength(3);
    expect(joined).toHaveLength(1);
  });

  it('WAITING: finish() langsung ke FINISHED', () => {
    const session = buildSession();
    session.finish();
    expect(session.status).toBe(GameStatus.FINISHED);
  });

  // ── IN_PROGRESS state ────────────────────────────────────────────────────

  it('IN_PROGRESS: canAcceptMove tidak melempar (lifecycle diizinkan)', () => {
    const session = buildSession();
    session.startGame();
    expect(() => session.canAcceptMove(dummyMove)).not.toThrow();
  });

  it('IN_PROGRESS: joinPlayer melempar', () => {
    const session = buildSession();
    session.startGame();
    expect(() => session.joinPlayer({ id: 'p3', name: 'Stranger' })).toThrow(
      'sudah berjalan',
    );
  });

  it('IN_PROGRESS: startGame melempar', () => {
    const session = buildSession();
    session.startGame();
    expect(() => session.startGame()).toThrow();
  });

  it('IN_PROGRESS: resume melempar', () => {
    const session = buildSession();
    session.startGame();
    expect(() => session.resume()).toThrow('tidak sedang di-pause');
  });

  it('IN_PROGRESS: pause() → PAUSED', () => {
    const session = buildSession();
    session.startGame();
    session.pause();
    expect(session.status).toBe(GameStatus.PAUSED);
  });

  it('IN_PROGRESS: finish() → FINISHED', () => {
    const session = buildSession();
    session.startGame();
    session.finish();
    expect(session.status).toBe(GameStatus.FINISHED);
  });

  // ── PAUSED state ─────────────────────────────────────────────────────────

  it('PAUSED: canAcceptMove melempar', () => {
    const session = buildSession();
    session.startGame();
    session.pause();
    expect(() => session.canAcceptMove(dummyMove)).toThrow('di-pause');
  });

  it('PAUSED: pause melempar (sudah di-pause)', () => {
    const session = buildSession();
    session.startGame();
    session.pause();
    expect(() => session.pause()).toThrow();
  });

  it('PAUSED: startGame melempar', () => {
    const session = buildSession();
    session.startGame();
    session.pause();
    expect(() => session.startGame()).toThrow('Game sudah dimulai sebelumnya');
  });

  it('PAUSED: resume() → IN_PROGRESS', () => {
    const session = buildSession();
    session.startGame();
    session.pause();
    session.resume();
    expect(session.status).toBe(GameStatus.IN_PROGRESS);
  });

  it('PAUSED: finish() → FINISHED', () => {
    const session = buildSession();
    session.startGame();
    session.pause();
    session.finish();
    expect(session.status).toBe(GameStatus.FINISHED);
  });

  // ── FINISHED state ───────────────────────────────────────────────────────

  it('FINISHED: semua aksi melempar', () => {
    const session = buildSession();
    session.finish();

    expect(() => session.joinPlayer(p1)).toThrow('sudah selesai');
    expect(() => session.canAcceptMove(dummyMove)).toThrow('sudah selesai');
    expect(() => session.startGame()).toThrow('sudah selesai');
    expect(() => session.pause()).toThrow('sudah selesai');
    expect(() => session.resume()).toThrow('sudah selesai');
    expect(() => session.finish()).toThrow('sudah selesai');
  });

  it('getState() melempar Error jika currentState belum diinisialisasi', () => {
    const session = buildSession();
    expect(() => session.getState()).toThrow('belum diinisialisasi');
  });

  // ── Observer: state.changed event ────────────────────────────────────────

  it('transitionTo() emit state.changed dengan from dan to yang benar', () => {
    const session = buildSession();
    const events: unknown[] = [];
    session.emitter.on('state.changed', (e) => events.push(e));

    session.startGame(); // WAITING → IN_PROGRESS
    session.pause();     // IN_PROGRESS → PAUSED

    expect(events).toHaveLength(2);
    expect((events[0] as { from: string; to: string }).from).toBe(GameStatus.WAITING);
    expect((events[0] as { from: string; to: string }).to).toBe(GameStatus.IN_PROGRESS);
    expect((events[1] as { from: string; to: string }).from).toBe(GameStatus.IN_PROGRESS);
    expect((events[1] as { from: string; to: string }).to).toBe(GameStatus.PAUSED);
  });
});
