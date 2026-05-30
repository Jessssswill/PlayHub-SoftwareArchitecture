import { GameEngineFacade } from '../src/business/facades/game-engine.facade';
import { GameRegistry } from '../src/infrastructure/registry/game-registry.service';
import { GameFactoryProvider } from '../src/business/factories/game-factory.provider';
import { GameSessionBuilder } from '../src/business/builders/game-session.builder';
import { TicTacToeFactory } from '../src/business/factories/tic-tac-toe.factory';
import { ChessFactory } from '../src/business/factories/chess.factory';
import { ConnectFourFactory } from '../src/business/factories/connect-four.factory';
import { TicTacToeGame } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from '../src/business/domain/games/chess/chess.game';
import { ConnectFourGame } from '../src/business/domain/games/connect-four/connect-four.game';
import { MoveValidationService } from '../src/business/services/move-validation.service';
import { GameEventBus } from '../src/business/events/game-event-bus';
import { GameType } from '../src/shared/types/game-type.enum';
import { GameStatus } from '../src/shared/types/game-status.enum';
import { Player } from '../src/shared/types/player.interface';
import { TicTacToeMove, ConnectFourMove } from '../src/shared/types/move.types';

const p1: Player = { id: 'p1', name: 'Alice' };
const p2: Player = { id: 'p2', name: 'Bob' };

const buildFacade = () => {
  const tttFactory = new TicTacToeFactory();
  const chessFactory = new ChessFactory();
  const c4Factory = new ConnectFourFactory();
  const factoryProvider = new GameFactoryProvider(tttFactory, chessFactory, c4Factory);
  const builder = new GameSessionBuilder();
  const tttGame = new TicTacToeGame();
  const chessGame = new ChessGame();
  const c4Game = new ConnectFourGame();
  const registry = new GameRegistry();
  const validationService = new MoveValidationService();
  const eventBus = new GameEventBus();
  const facade = new GameEngineFacade(registry, factoryProvider, builder, tttGame, chessGame, c4Game, validationService, eventBus);
  return { facade, registry };
};

describe('Facade — GameEngineFacade', () => {
  let facade: GameEngineFacade;
  let registry: GameRegistry;

  beforeEach(() => {
    ({ facade, registry } = buildFacade());
  });

  // ── createSession ─────────────────────────────────────────────────────────

  it('createSession() mengembalikan session dengan ID unik', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    expect(session.id).toBeTruthy();
    expect(typeof session.id).toBe('string');
  });

  it('createSession() langsung memulai game — status IN_PROGRESS', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    expect(session.status).toBe(GameStatus.IN_PROGRESS);
  });

  it('createSession() mendaftarkan session ke registry', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    expect(registry.has(session.id)).toBe(true);
  });

  it('createSession() menginisialisasi currentState via factory', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    expect(session.currentState).not.toBeNull();
    expect(session.currentState?.boardState).toHaveLength(3); // 3×3 TicTacToe
  });

  it('createSession() Chess menghasilkan papan 8×8', async () => {
    const session = await facade.createSession(GameType.CHESS, [p1, p2]);
    expect(session.currentState?.boardState).toHaveLength(8);
  });

  it('createSession() Connect Four menghasilkan papan 6×7', async () => {
    const session = await facade.createSession(GameType.CONNECT_FOUR, [p1, p2]);
    expect(session.currentState?.boardState).toHaveLength(6);
    expect(session.currentState?.boardState[0]).toHaveLength(7);
  });

  // ── getState ──────────────────────────────────────────────────────────────

  it('getState() mengembalikan GameState yang benar', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    const state = await facade.getState(session.id);
    expect(state).toBeDefined();
    expect(state.playerOrder).toEqual([p1.id, p2.id]);
    expect(state.currentPlayerId).toBe(p1.id);
  });

  it('getState() throw untuk sessionId tidak dikenal', async () => {
    await expect(facade.getState('nonexistent')).rejects.toThrow();
  });

  // ── getSession ────────────────────────────────────────────────────────────

  it('getSession() mengembalikan full GameSession dengan emitter', async () => {
    const created = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    const retrieved = facade.getSession(created.id);
    expect(retrieved).toBe(created); // referensi sama dari registry
    expect(retrieved.emitter).toBeDefined();
  });

  // ── makeMove ──────────────────────────────────────────────────────────────

  it('makeMove() memperbarui board state session (TicTacToe)', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    const move: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: p1.id,
      row: 1,
      col: 1,
    };
    await facade.makeMove(session.id, p1.id, move);
    expect(session.currentState?.boardState[1][1]).toBe('X');
  });

  it('makeMove() memperbarui board state session (Connect Four)', async () => {
    const session = await facade.createSession(GameType.CONNECT_FOUR, [p1, p2]);
    const move: ConnectFourMove = {
      gameType: GameType.CONNECT_FOUR,
      playerId: p1.id,
      col: 3,
    };
    await facade.makeMove(session.id, p1.id, move);
    // Di Connect Four, biji jatuh ke baris paling bawah (indeks 5)
    expect(session.currentState?.boardState[5][3]).toBe('R');
  });

  it('makeMove() mengembalikan TurnResult dengan newState', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    const move: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: p1.id,
      row: 0,
      col: 0,
    };
    const result = await facade.makeMove(session.id, p1.id, move);
    expect(result.newState).toBeDefined();
    expect(result.endResult).toBeDefined();
  });

  it('makeMove() throw ketika state machine tidak mengizinkan', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    session.pause(); // → PAUSED
    const move: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: p1.id,
      row: 0,
      col: 0,
    };
    await expect(facade.makeMove(session.id, p1.id, move)).rejects.toThrow('pause');
  });

  it('makeMove() mendeteksi kemenangan dan finish session', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);

    // Simulasi kondisi hampir menang: X di [0,0] dan [0,1], O di [1,0] dan [1,1]
    if (session.currentState) {
      session.currentState.boardState[0][0] = 'X';
      session.currentState.boardState[0][1] = 'X';
      session.currentState.boardState[1][0] = 'O';
      session.currentState.boardState[1][1] = 'O';
      session.currentState.moveCount = 4;
    }

    const winningMove: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: p1.id,
      row: 0,
      col: 2,
    };
    const result = await facade.makeMove(session.id, p1.id, winningMove);
    expect(result.endResult.isOver).toBe(true);
    expect(result.endResult.winnerId).toBe(p1.id);
    expect(session.status).toBe(GameStatus.FINISHED);
  });

  // ── endSession ────────────────────────────────────────────────────────────

  it('endSession() mengubah status session ke FINISHED', async () => {
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    await facade.endSession(session.id);
    expect(session.status).toBe(GameStatus.FINISHED);
  });

  // ── listSessions ──────────────────────────────────────────────────────────

  it('listSessions() mengembalikan semua sesi yang terdaftar', async () => {
    await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    await facade.createSession(GameType.CHESS, [p1, p2]);
    expect(facade.listSessions()).toHaveLength(2);
  });
});
