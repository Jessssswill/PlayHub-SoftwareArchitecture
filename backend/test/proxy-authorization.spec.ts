import { ForbiddenException } from '@nestjs/common';
import { GameEngineAuthorizationProxy } from '../src/persistence/proxies/authorization.proxy';
import { GameEngineFacade } from '../src/business/facades/game-engine.facade';
import { GameRegistry } from '../src/infrastructure/registry/game-registry.service';
import { GameFactoryProvider } from '../src/business/factories/game-factory.provider';
import { GameSessionBuilder } from '../src/business/builders/game-session.builder';
import { TicTacToeFactory } from '../src/business/factories/tic-tac-toe.factory';
import { ChessFactory } from '../src/business/factories/chess.factory';
import { TicTacToeGame } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from '../src/business/domain/games/chess/chess.game';
import { MoveValidationService } from '../src/business/services/move-validation.service';
import { GameEventBus } from '../src/business/events/game-event-bus';
import { GameType } from '../src/shared/types/game-type.enum';
import { Player } from '../src/shared/types/player.interface';
import { TicTacToeMove } from '../src/shared/types/move.types';

const p1: Player = { id: 'p1', name: 'Alice' };
const p2: Player = { id: 'p2', name: 'Bob' };
const intruder: Player = { id: 'intruder', name: 'Hacker' };

const buildProxy = () => {
  const tttFactory = new TicTacToeFactory();
  const chessFactory = new ChessFactory();
  const factoryProvider = new GameFactoryProvider(tttFactory, chessFactory);
  const builder = new GameSessionBuilder();
  const registry = new GameRegistry();
  const facade = new GameEngineFacade(
    registry,
    factoryProvider,
    builder,
    new TicTacToeGame(),
    new ChessGame(),
    new MoveValidationService(),
    new GameEventBus(),
  );
  const proxy = new GameEngineAuthorizationProxy(facade, registry);
  return { proxy, facade, registry };
};

const validMove = (playerId: string): TicTacToeMove => ({
  gameType: GameType.TIC_TAC_TOE,
  playerId,
  row: 0,
  col: 0,
});

describe('Proxy (Protection) — GameEngineAuthorizationProxy', () => {
  let proxy: GameEngineAuthorizationProxy;
  let facade: GameEngineFacade;
  let sessionId: string;

  beforeEach(async () => {
    ({ proxy, facade } = buildProxy());
    const session = await facade.createSession(GameType.TIC_TAC_TOE, [p1, p2]);
    sessionId = session.id;
  });

  // ── makeMove authorization ────────────────────────────────────────────────

  it('player terdaftar (p1) bisa makeMove tanpa error', async () => {
    await expect(
      proxy.makeMove(sessionId, p1.id, validMove(p1.id)),
    ).resolves.toBeDefined();
  });

  it('player tidak terdaftar mendapat ForbiddenException', async () => {
    await expect(
      proxy.makeMove(sessionId, intruder.id, validMove(intruder.id)),
    ).rejects.toThrow(ForbiddenException);
  });

  it('ForbiddenException mengandung info sessionId dan playerId', async () => {
    await expect(
      proxy.makeMove(sessionId, intruder.id, validMove(intruder.id)),
    ).rejects.toThrow(intruder.id);
  });

  it('p2 juga bisa makeMove setelah giliran berpindah', async () => {
    // p1 jalan dulu
    await proxy.makeMove(sessionId, p1.id, validMove(p1.id));

    // Sekarang giliran p2
    const p2move: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: p2.id,
      row: 1,
      col: 0,
    };
    await expect(proxy.makeMove(sessionId, p2.id, p2move)).resolves.toBeDefined();
  });

  // ── endSession authorization ──────────────────────────────────────────────

  it('player terdaftar bisa endSession', async () => {
    await expect(proxy.endSession(sessionId, p1.id)).resolves.toBeUndefined();
  });

  it('non-player tidak bisa endSession', async () => {
    await expect(proxy.endSession(sessionId, intruder.id)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // ── pass-through methods ──────────────────────────────────────────────────

  it('getState() diteruskan ke facade tanpa modifikasi', async () => {
    const state = await proxy.getState(sessionId);
    expect(state).toBeDefined();
    expect(state.currentPlayerId).toBe(p1.id);
  });

  it('listSessions() diteruskan ke facade', () => {
    const sessions = proxy.listSessions();
    expect(sessions).toHaveLength(1);
  });
});
