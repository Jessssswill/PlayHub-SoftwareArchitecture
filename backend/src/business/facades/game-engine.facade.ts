import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRegistry } from '../../infrastructure/registry/game-registry.service';
import { GameFactoryProvider } from '../factories/game-factory.provider';
import { GameSessionBuilder } from '../builders/game-session.builder';
import { TicTacToeGame } from '../domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from '../domain/games/chess/chess.game';
import { ConnectFourGame } from '../domain/games/connect-four/connect-four.game';
import { Game, TurnResult } from '../domain/games/game.abstract';
import { GameSession } from '../domain/game-session';
import { GameState } from '../domain/games/game-state';
import { GameEventBus } from '../events/game-event-bus';
import { MoveValidationService } from '../services/move-validation.service';
import { GameType } from '../../shared/types/game-type.enum';
import { Player } from '../../shared/types/player.interface';
import { Move } from '../../shared/types/move.types';

@Injectable()
export class GameEngineFacade {
  private readonly engines: Map<GameType, Game>;

  constructor(
    private readonly registry: GameRegistry,
    private readonly factoryProvider: GameFactoryProvider,
    private readonly tttGame: TicTacToeGame,
    private readonly chessGame: ChessGame,
    private readonly connectFourGame: ConnectFourGame,
    private readonly validationService: MoveValidationService,
    private readonly eventBus: GameEventBus,
  ) {
    this.engines = new Map<GameType, Game>([
      [GameType.TIC_TAC_TOE, this.tttGame],
      [GameType.CHESS, this.chessGame],
      [GameType.CONNECT_FOUR, this.connectFourGame],
    ]);
  }

  async createSession(
    gameType: GameType,
    players: Player[],
    options?: { timeControlSeconds?: number; isPrivate?: boolean; allowSpectators?: boolean }
  ): Promise<GameSession> {
    const builder = new GameSessionBuilder();
    builder.forGame(gameType);
    
    players.forEach(p => builder.addPlayer(p));
    
    if (options?.timeControlSeconds) builder.withTimeControl(options.timeControlSeconds);
    if (options?.isPrivate) builder.asPrivate();
    if (options?.allowSpectators) builder.withSpectators();

    const session = builder.build();

    if (players.length === 2) {
      const factory = this.factoryProvider.getFactory(gameType);
      const initialState = factory.createInitialState([
        players[0].id,
        players[1].id,
      ]);
      session.currentState = initialState;
      session.startGame();
    }

    this.registry.register(session);
    this.bridgeToEventBus(session);
    return session;
  }

  async joinSession(sessionId: string, player: Player): Promise<void> {
    const session = this.registry.get(sessionId);
    session.joinPlayer(player);

    if (session.players.length === 2 && session.status === 'WAITING') {
      const factory = this.factoryProvider.getFactory(session.gameType);
      const initialState = factory.createInitialState([
        session.players[0].id,
        session.players[1].id,
      ]);
      session.currentState = initialState;
      session.startGame();
    }
  }

  async makeMove(
    sessionId: string,
    playerId: string,
    move: Move,
  ): Promise<TurnResult> {
    const session = this.registry.get(sessionId);

    session.canAcceptMove(move);

    const engine = this.engines.get(session.gameType);
    if (!engine) {
      throw new NotFoundException(
        `Game engine tidak ditemukan untuk: ${session.gameType}`,
      );
    }

    if (!session.currentState) {
      throw new NotFoundException('Game state belum diinisialisasi.');
    }

    this.validationService.validate(session, playerId, move, engine);

    const result = engine.executeTurn(
      session.currentState,
      move,
      session.emitter,
    );
    session.currentState = result.newState;

    if (result.endResult.isOver) {
      session.finish();
    }

    return result;
  }

  async getState(sessionId: string): Promise<GameState> {
    const session = this.registry.get(sessionId);
    if (!session.currentState) {
      throw new NotFoundException(
        'Game state belum diinisialisasi untuk sesi ini.',
      );
    }
    return session.currentState;
  }

  getSession(sessionId: string): GameSession {
    return this.registry.get(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.registry.get(sessionId);
    session.finish();
  }

  listSessions(): GameSession[] {
    return this.registry.getAll();
  }

  private bridgeToEventBus(session: GameSession): void {
    const id = session.id;
    session.emitter.on('move.applied', (p) =>
      this.eventBus.emit('move.applied', { ...p, sessionId: id }),
    );
    session.emitter.on('state.changed', (p) =>
      this.eventBus.emit('state.changed', { ...p, sessionId: id }),
    );
    session.emitter.on('player.joined', (p) =>
      this.eventBus.emit('player.joined', { ...p, sessionId: id }),
    );
    session.emitter.on('game.finished', (p) =>
      this.eventBus.emit('game.finished', { ...p, sessionId: id }),
    );
  }
}
