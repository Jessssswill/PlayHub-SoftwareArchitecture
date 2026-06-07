import { Test, TestingModule } from '@nestjs/testing';
import { GameRegistry } from '../src/infrastructure/registry/game-registry.service';
import { GameSession } from '../src/business/domain/game-session';
import { GameType } from '../src/shared/types/game-type.enum';
import { GameStatus } from '../src/shared/types/game-status.enum';

const makeSession = (id: string): GameSession =>
  new GameSession({
    id,
    gameType: GameType.TIC_TAC_TOE,
    players: [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ],
    status: GameStatus.WAITING,
    currentState: null,
    createdAt: new Date(),
    timeControlSeconds: 0,
    isPrivate: false,
    allowSpectators: false,
    maxSpectators: 0,
  });

describe('Singleton - GameRegistry via NestJS DI', () => {
  let module: TestingModule;
  let registryA: GameRegistry;
  let registryB: GameRegistry;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [GameRegistry],
    }).compile();

    // DI harus mengembalikan instance yang sama (singleton scope default)
    registryA = module.get<GameRegistry>(GameRegistry);
    registryB = module.get<GameRegistry>(GameRegistry);
  });

  afterEach(async () => {
    await module.close();
  });

  it('DI mengembalikan instance yang sama (referensi identik)', () => {
    expect(registryA).toBe(registryB);
  });

  it('register() menyimpan session dan get() mengembalikannya', () => {
    const session = makeSession('session-1');
    registryA.register(session);
    expect(registryB.get('session-1')).toBe(session);
  });

  it('unregister() menghapus session dari registry', () => {
    const session = makeSession('session-2');
    registryA.register(session);
    registryA.unregister('session-2');
    expect(() => registryA.get('session-2')).toThrow();
  });

  it('getAll() mengembalikan semua session yang terdaftar', () => {
    registryA.register(makeSession('s1'));
    registryA.register(makeSession('s2'));
    expect(registryA.getAll()).toHaveLength(2);
  });

  it('getByPlayer() mengembalikan session yang mengandung player tersebut', () => {
    registryA.register(makeSession('s3'));
    const result = registryA.getByPlayer('p1');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe('s3');
  });

  it('get() dengan ID tidak ada throw NotFoundException', () => {
    expect(() => registryA.get('nonexistent')).toThrow();
  });

  it('has() return true jika session ada, false jika tidak', () => {
    registryA.register(makeSession('s4'));
    expect(registryA.has('s4')).toBe(true);
    expect(registryA.has('nope')).toBe(false);
  });
});
