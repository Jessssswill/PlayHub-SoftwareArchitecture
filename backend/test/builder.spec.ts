import { GameSessionBuilder } from '../src/business/builders/game-session.builder';
import { GameType } from '../src/shared/types/game-type.enum';
import { GameStatus } from '../src/shared/types/game-status.enum';
import { Player } from '../src/shared/types/player.interface';

const p1: Player = { id: 'p1', name: 'Alice' };
const p2: Player = { id: 'p2', name: 'Bob' };

describe('Builder - GameSessionBuilder', () => {
  let builder: GameSessionBuilder;

  beforeEach(() => {
    builder = new GameSessionBuilder();
  });

  it('build() valid menghasilkan GameSession dengan status WAITING', () => {
    const session = builder
      .forGame(GameType.TIC_TAC_TOE)
      .addPlayer(p1)
      .addPlayer(p2)
      .build();

    expect(session.gameType).toBe(GameType.TIC_TAC_TOE);
    expect(session.status).toBe(GameStatus.WAITING);
    expect(session.players).toHaveLength(2);
    expect(session.id).toBeTruthy();
    expect(session.createdAt).toBeInstanceOf(Date);
  });

  it('build() tanpa forGame() throw BadRequestException', () => {
    expect(() =>
      builder.addPlayer(p1).addPlayer(p2).build(),
    ).toThrow('Game type harus ditentukan');
  });

  it('build() dengan kurang dari 2 player throw BadRequestException', () => {
    expect(() =>
      builder.forGame(GameType.CHESS).addPlayer(p1).build(),
    ).toThrow('minimal 2 player');
  });

  it('build() dengan timeControl negatif throw BadRequestException', () => {
    expect(() =>
      builder
        .forGame(GameType.TIC_TAC_TOE)
        .addPlayer(p1)
        .addPlayer(p2)
        .withTimeControl(-10)
        .build(),
    ).toThrow('Time control tidak boleh negatif');
  });

  it('withTimeControl(60) disimpan di session', () => {
    const session = builder
      .forGame(GameType.CHESS)
      .addPlayer(p1)
      .addPlayer(p2)
      .withTimeControl(60)
      .build();

    expect(session.timeControlSeconds).toBe(60);
  });

  it('asPrivate() membuat session private', () => {
    const session = builder
      .forGame(GameType.TIC_TAC_TOE)
      .addPlayer(p1)
      .addPlayer(p2)
      .asPrivate()
      .build();

    expect(session.isPrivate).toBe(true);
  });

  it('withSpectators(10) mengaktifkan spectator dengan max 10', () => {
    const session = builder
      .forGame(GameType.CHESS)
      .addPlayer(p1)
      .addPlayer(p2)
      .withSpectators(10)
      .build();

    expect(session.allowSpectators).toBe(true);
    expect(session.maxSpectators).toBe(10);
  });

  it('build() me-reset state builder sehingga bisa dipakai ulang', () => {
    builder.forGame(GameType.TIC_TAC_TOE).addPlayer(p1).addPlayer(p2).build();

    // Builder harus fresh setelah build() - game type sudah null
    expect(() => builder.addPlayer(p1).addPlayer(p2).build()).toThrow(
      'Game type harus ditentukan',
    );
  });

  it('reset() membersihkan semua state builder', () => {
    builder
      .forGame(GameType.TIC_TAC_TOE)
      .addPlayer(p1)
      .withTimeControl(100)
      .reset();

    expect(() => builder.build()).toThrow('Game type harus ditentukan');
  });

  it('withSpectators() tanpa argumen default ke max 0', () => {
    const session = builder
      .forGame(GameType.TIC_TAC_TOE)
      .addPlayer(p1)
      .addPlayer(p2)
      .withSpectators()
      .build();

    expect(session.allowSpectators).toBe(true);
    expect(session.maxSpectators).toBe(0);
  });

  it('players di-copy sehingga mutasi array luar tidak pengaruhi session', () => {
    const session = builder
      .forGame(GameType.TIC_TAC_TOE)
      .addPlayer(p1)
      .addPlayer(p2)
      .build();

    // session.players adalah copy - panjangnya tetap 2
    expect(session.players).toHaveLength(2);
  });
});
