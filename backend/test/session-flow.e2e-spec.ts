import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { SessionController } from '../src/presentation/controllers/session.controller';
import { GameGateway } from '../src/presentation/gateways/game.gateway';
import { GameEngineAuthorizationProxy } from '../src/persistence/proxies/authorization.proxy';
import { CachedGameStateProxy } from '../src/persistence/proxies/cached-game-state.proxy';
import { InMemoryStorage } from '../src/persistence/adapters/in-memory.storage';
import { SESSION_STORAGE_TOKEN } from '../src/persistence/adapters/storage.interface';
import { GameEngineFacade } from '../src/business/facades/game-engine.facade';
import { MoveValidationService } from '../src/business/services/move-validation.service';
import { GameEventBus } from '../src/business/events/game-event-bus';
import { GameRegistry } from '../src/infrastructure/registry/game-registry.service';
import { AppConfigService } from '../src/infrastructure/config/app-config.service';
import { GameFactoryProvider } from '../src/business/factories/game-factory.provider';
import { GameSessionBuilder } from '../src/business/builders/game-session.builder';
import { TicTacToeFactory } from '../src/business/factories/tic-tac-toe.factory';
import { ChessFactory } from '../src/business/factories/chess.factory';
import { ConnectFourFactory } from '../src/business/factories/connect-four.factory';
import { TicTacToeGame } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from '../src/business/domain/games/chess/chess.game';
import { ConnectFourGame } from '../src/business/domain/games/connect-four/connect-four.game';
import { GameType } from '../src/shared/types/game-type.enum';
import { GameStatus } from '../src/shared/types/game-status.enum';

describe('Session Flow (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [SessionController],
      providers: [
        // Infrastructure
        AppConfigService,
        GameRegistry,
        // Business
        TicTacToeFactory,
        ChessFactory,
        ConnectFourFactory,
        GameFactoryProvider,
        GameSessionBuilder,
        TicTacToeGame,
        ChessGame,
        ConnectFourGame,
        MoveValidationService,
        GameEventBus,
        GameEngineFacade,
        // Persistence - in-memory, no TypeORM
        InMemoryStorage,
        { provide: SESSION_STORAGE_TOKEN, useClass: InMemoryStorage },
        GameEngineAuthorizationProxy,
        CachedGameStateProxy,
        // Gateway (Observer)
        GameGateway,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Full session lifecycle ─────────────────────────────────────────────────

  it('POST /sessions → membuat sesi TicTacToe dan langsung IN_PROGRESS', async () => {
    const res = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [
          { id: 'e2e-alice', name: 'Alice' },
          { id: 'e2e-bob', name: 'Bob' },
        ],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe(GameStatus.IN_PROGRESS);
    expect(res.body.gameType).toBe(GameType.TIC_TAC_TOE);
    expect(res.body.players).toHaveLength(2);
  });

  it('Full flow: create → make moves → end session', async () => {
    // 1. Create session
    const createRes = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [
          { id: 'flow-alice', name: 'Alice' },
          { id: 'flow-bob', name: 'Bob' },
        ],
      })
      .expect(201);

    const sessionId: string = createRes.body.id;
    expect(sessionId).toBeTruthy();

    // 2. GET session state
    const stateRes = await request(app.getHttpServer())
      .get(`/sessions/${sessionId}`)
      .expect(200);

    expect(stateRes.body.currentPlayerId).toBe('flow-alice');
    expect(stateRes.body.boardState).toHaveLength(3);

    // 3. Alice makes move (0,0)
    const move1 = await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/move`)
      .send({
        playerId: 'flow-alice',
        move: { gameType: GameType.TIC_TAC_TOE, playerId: 'flow-alice', row: 0, col: 0 },
      })
      .expect(201);

    expect(move1.body.newState.boardState[0][0]).toBe('X');
    expect(move1.body.newState.currentPlayerId).toBe('flow-bob');

    // 4. Bob makes move (1,1)
    const move2 = await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/move`)
      .send({
        playerId: 'flow-bob',
        move: { gameType: GameType.TIC_TAC_TOE, playerId: 'flow-bob', row: 1, col: 1 },
      })
      .expect(201);

    expect(move2.body.newState.boardState[1][1]).toBe('O');

    // 5. Alice makes move (0,1)
    await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/move`)
      .send({
        playerId: 'flow-alice',
        move: { gameType: GameType.TIC_TAC_TOE, playerId: 'flow-alice', row: 0, col: 1 },
      })
      .expect(201);

    // 6. End session
    const endRes = await request(app.getHttpServer())
      .delete(`/sessions/${sessionId}?requesterId=flow-alice`)
      .expect(200);

    expect(endRes.body.ended).toBe(true);
    expect(endRes.body.sessionId).toBe(sessionId);
  });

  // ── Validation errors ──────────────────────────────────────────────────────

  it('POST /sessions → 400 jika gameType tidak valid', async () => {
    await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: 'INVALID_GAME',
        players: [
          { id: 'p1', name: 'Alice' },
          { id: 'p2', name: 'Bob' },
        ],
      })
      .expect(400);
  });

  it('POST /sessions → 400 jika kurang dari 2 players', async () => {
    await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [{ id: 'p1', name: 'Alice' }],
      })
      .expect(400);
  });

  it('POST /sessions/:id/move → 400 jika move salah giliran', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [
          { id: 'turn-alice', name: 'Alice' },
          { id: 'turn-bob', name: 'Bob' },
        ],
      })
      .expect(201);

    const sessionId: string = createRes.body.id;

    // Bob mencoba jalan, padahal giliran Alice
    await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/move`)
      .send({
        playerId: 'turn-bob',
        move: { gameType: GameType.TIC_TAC_TOE, playerId: 'turn-bob', row: 0, col: 0 },
      })
      .expect(400);
  });

  it('POST /sessions/:id/move → 403 jika player bukan anggota sesi', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [
          { id: 'auth-alice', name: 'Alice' },
          { id: 'auth-bob', name: 'Bob' },
        ],
      })
      .expect(201);

    const sessionId: string = createRes.body.id;

    await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/move`)
      .send({
        playerId: 'intruder-99',
        move: { gameType: GameType.TIC_TAC_TOE, playerId: 'intruder-99', row: 0, col: 0 },
      })
      .expect(403);
  });

  it('GET /sessions/:id → 404 untuk session yang tidak ada', async () => {
    await request(app.getHttpServer())
      .get('/sessions/nonexistent-id')
      .expect(404);
  });

  it('DELETE /sessions/:id → 403 jika requesterId bukan anggota sesi', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [
          { id: 'del-alice', name: 'Alice' },
          { id: 'del-bob', name: 'Bob' },
        ],
      })
      .expect(201);

    const sessionId: string = createRes.body.id;

    await request(app.getHttpServer())
      .delete(`/sessions/${sessionId}?requesterId=random-intruder`)
      .expect(403);
  });

  // ── GET /sessions list ─────────────────────────────────────────────────────

  it('GET /sessions → mengembalikan semua sesi', async () => {
    const res = await request(app.getHttpServer()).get('/sessions').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /sessions?status=IN_PROGRESS → hanya sesi aktif', async () => {
    const res = await request(app.getHttpServer())
      .get(`/sessions?status=${GameStatus.IN_PROGRESS}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((s: { status: GameStatus }) => {
      expect(s.status).toBe(GameStatus.IN_PROGRESS);
    });
  });

  // ── Demo endpoint ─────────────────────────────────────────────────────────

  it('POST /sessions/demo → membuat sesi demo dengan 3 move pre-played', async () => {
    const res = await request(app.getHttpServer())
      .post('/sessions/demo')
      .expect(201);

    expect(res.body.sessionId).toBeDefined();
    expect(res.body.state).toBeDefined();
    // After 3 moves: board[0][0]='X', board[1][1]='O', board[0][1]='X'
    expect(res.body.state.boardState[0][0]).toBe('X');
    expect(res.body.state.boardState[1][1]).toBe('O');
    expect(res.body.state.boardState[0][1]).toBe('X');
  });
});
