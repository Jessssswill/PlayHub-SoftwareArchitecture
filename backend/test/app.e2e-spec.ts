import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
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
import { TicTacToeGame } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from '../src/business/domain/games/chess/chess.game';
import { GameType } from '../src/shared/types/game-type.enum';

describe('App (e2e) — sanity check', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [SessionController],
      providers: [
        AppConfigService,
        GameRegistry,
        TicTacToeFactory,
        ChessFactory,
        GameFactoryProvider,
        GameSessionBuilder,
        TicTacToeGame,
        ChessGame,
        MoveValidationService,
        GameEventBus,
        GameEngineFacade,
        InMemoryStorage,
        { provide: SESSION_STORAGE_TOKEN, useClass: InMemoryStorage },
        GameEngineAuthorizationProxy,
        CachedGameStateProxy,
        GameGateway,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /sessions → 200 dengan array kosong saat tidak ada sesi', async () => {
    const res = await request(app.getHttpServer()).get('/sessions').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /sessions → 201 dengan sesi TicTacToe baru', async () => {
    const res = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        gameType: GameType.TIC_TAC_TOE,
        players: [
          { id: 'sanity-p1', name: 'Sanity Alice' },
          { id: 'sanity-p2', name: 'Sanity Bob' },
        ],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.gameType).toBe(GameType.TIC_TAC_TOE);
  });
});
