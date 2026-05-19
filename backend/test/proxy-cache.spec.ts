import { CachedGameStateProxy } from '../src/persistence/proxies/cached-game-state.proxy';
import { GameEngineFacade } from '../src/business/facades/game-engine.facade';
import { GameSession } from '../src/business/domain/game-session';
import { GameState } from '../src/business/domain/games/game-state';
import { GameStatus } from '../src/shared/types/game-status.enum';
import { GameType } from '../src/shared/types/game-type.enum';

const makeState = (marker = 'A'): GameState =>
  new GameState({
    boardState: [[marker, '', ''], ['', '', ''], ['', '', '']],
    currentPlayerId: 'p1',
    playerOrder: ['p1', 'p2'],
  });

const makeSession = (id: string): GameSession =>
  new GameSession({
    id,
    gameType: GameType.TIC_TAC_TOE,
    players: [{ id: 'p1', name: 'A' }, { id: 'p2', name: 'B' }],
    status: GameStatus.IN_PROGRESS,
    currentState: makeState(),
    createdAt: new Date(),
    timeControlSeconds: 0,
    isPrivate: false,
    allowSpectators: false,
    maxSpectators: 0,
  });

describe('Proxy (Caching) — CachedGameStateProxy', () => {
  let proxy: CachedGameStateProxy;
  let mockFacade: jest.Mocked<Pick<GameEngineFacade, 'getState' | 'getSession'>>;
  let session: GameSession;
  const sessionId = 'test-session';

  beforeEach(() => {
    session = makeSession(sessionId);
    const stateA = makeState('A');

    mockFacade = {
      getState: jest.fn().mockResolvedValue(stateA),
      getSession: jest.fn().mockReturnValue(session),
    };

    proxy = new CachedGameStateProxy(mockFacade as unknown as GameEngineFacade);
  });

  // ── Caching behavior ──────────────────────────────────────────────────────

  it('getState() pertama kali memanggil facade.getState()', async () => {
    await proxy.getState(sessionId);
    expect(mockFacade.getState).toHaveBeenCalledTimes(1);
  });

  it('getState() kedua dalam TTL mengembalikan referensi yang sama (cache hit)', async () => {
    const s1 = await proxy.getState(sessionId);
    const s2 = await proxy.getState(sessionId);

    expect(s1).toBe(s2);
    expect(mockFacade.getState).toHaveBeenCalledTimes(1); // facade hanya dipanggil sekali
  });

  it('beberapa getState() berturut-turut hanya trigger 1 facade call', async () => {
    await proxy.getState(sessionId);
    await proxy.getState(sessionId);
    await proxy.getState(sessionId);

    expect(mockFacade.getState).toHaveBeenCalledTimes(1);
  });

  // ── Invalidation ──────────────────────────────────────────────────────────

  it('invalidate() membuat getState() berikutnya fetch ulang dari facade', async () => {
    const stateB = makeState('B');
    mockFacade.getState
      .mockResolvedValueOnce(makeState('A'))
      .mockResolvedValueOnce(stateB);

    const s1 = await proxy.getState(sessionId);
    proxy.invalidate(sessionId);
    const s2 = await proxy.getState(sessionId);

    expect(s1).not.toBe(s2);
    expect(mockFacade.getState).toHaveBeenCalledTimes(2);
  });

  it('setelah invalidate(), state baru dikembalikan oleh facade', async () => {
    const freshState = makeState('FRESH');
    mockFacade.getState
      .mockResolvedValueOnce(makeState('OLD'))
      .mockResolvedValueOnce(freshState);

    await proxy.getState(sessionId);
    proxy.invalidate(sessionId);
    const result = await proxy.getState(sessionId);

    expect(result).toBe(freshState);
  });

  // ── Auto-invalidation via Observer ────────────────────────────────────────

  it('auto-invalidate saat move.applied diterima dari session emitter', async () => {
    const stateAfterMove = makeState('AFTER_MOVE');
    mockFacade.getState
      .mockResolvedValueOnce(makeState('BEFORE'))
      .mockResolvedValueOnce(stateAfterMove);

    // Cache state pertama (juga subscribe ke emitter)
    const before = await proxy.getState(sessionId);

    // Emit move.applied — proxy harus auto-invalidate
    session.emitter.emit('move.applied', {
      newState: stateAfterMove,
      move: { gameType: GameType.TIC_TAC_TOE, playerId: 'p1', row: 0, col: 0 },
      endResult: { isOver: false, winnerId: null, isDraw: false },
    });

    // State setelah move harus berbeda dari cache lama
    const after = await proxy.getState(sessionId);
    expect(before).not.toBe(after);
    expect(mockFacade.getState).toHaveBeenCalledTimes(2);
  });

  it('subscribe ke emitter hanya dilakukan sekali per sesi', async () => {
    await proxy.getState(sessionId);
    await proxy.getState(sessionId); // cache hit — tidak subscribe ulang
    proxy.invalidate(sessionId);
    await proxy.getState(sessionId); // cache miss — cek subscription

    // getSession hanya dipanggil sekali (saat subscribe pertama kali)
    expect(mockFacade.getSession).toHaveBeenCalledTimes(1);
  });

  // ── Cache size ────────────────────────────────────────────────────────────

  it('cacheSize bertambah saat entry baru di-cache', async () => {
    expect(proxy.cacheSize).toBe(0);
    await proxy.getState(sessionId);
    expect(proxy.cacheSize).toBe(1);
  });

  it('cacheSize berkurang setelah invalidate()', async () => {
    await proxy.getState(sessionId);
    proxy.invalidate(sessionId);
    expect(proxy.cacheSize).toBe(0);
  });
});
