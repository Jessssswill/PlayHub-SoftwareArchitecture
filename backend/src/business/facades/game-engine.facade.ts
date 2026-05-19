import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRegistry } from '../../infrastructure/registry/game-registry.service';
import { GameFactoryProvider } from '../factories/game-factory.provider';
import { GameSessionBuilder } from '../builders/game-session.builder';
import { TicTacToeGame } from '../domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from '../domain/games/chess/chess.game';
import { Game, TurnResult } from '../domain/games/game.abstract';
import { GameSession } from '../domain/game-session';
import { GameState } from '../domain/games/game-state';
import { GameEventBus } from '../events/game-event-bus';
import { MoveValidationService } from '../services/move-validation.service';
import { GameType } from '../../shared/types/game-type.enum';
import { Player } from '../../shared/types/player.interface';
import { Move } from '../../shared/types/move.types';

/**
 * @pattern Facade
 * @intent Berikan satu API sederhana untuk semua operasi game — sembunyikan
 *         koordinasi internal antara GameRegistry, factory, builder, state machine,
 *         dan game engine. Presenter tidak perlu tahu cara kerja dalamnya.
 * @participants GameRegistry, GameFactoryProvider, GameSessionBuilder,
 *               TicTacToeGame, ChessGame (subsystems)
 */
@Injectable()
export class GameEngineFacade {
  private readonly engines: Map<GameType, Game>;

  constructor(
    private readonly registry: GameRegistry,
    private readonly factoryProvider: GameFactoryProvider,
    private readonly builder: GameSessionBuilder,
    private readonly tttGame: TicTacToeGame,
    private readonly chessGame: ChessGame,
    private readonly validationService: MoveValidationService,
    private readonly eventBus: GameEventBus,
  ) {
    this.engines = new Map<GameType, Game>([
      [GameType.TIC_TAC_TOE, this.tttGame],
      [GameType.CHESS, this.chessGame],
    ]);
  }

  /**
   * Buat sesi baru, inisialisasi game state via factory, mulai sesi.
   * Setelah method ini selesai, sesi langsung dalam status IN_PROGRESS.
   */
  async createSession(
    gameType: GameType,
    players: [Player, Player],
  ): Promise<GameSession> {
    const factory = this.factoryProvider.getFactory(gameType);
    const initialState = factory.createInitialState([players[0].id, players[1].id]);

    const session = this.builder
      .forGame(gameType)
      .addPlayer(players[0])
      .addPlayer(players[1])
      .build();

    session.currentState = initialState;
    session.startGame(); // WAITING → IN_PROGRESS

    this.registry.register(session);
    this.bridgeToEventBus(session);
    return session;
  }

  /** Tambahkan player ke sesi — delegasi ke state machine session. */
  async joinSession(sessionId: string, player: Player): Promise<void> {
    const session = this.registry.get(sessionId);
    session.joinPlayer(player);
  }

  /**
   * Eksekusi satu move:
   * 1. Lifecycle check via state machine (throw jika bukan IN_PROGRESS)
   * 2. Validasi giliran + legalitas move (MoveValidationService)
   * 3. Delegasi ke game engine (Template Method: validate → apply → checkEnd)
   * 4. Update currentState di session
   * 5. Finish session jika game selesai
   */
  async makeMove(
    sessionId: string,
    playerId: string,
    move: Move,
  ): Promise<TurnResult> {
    const session = this.registry.get(sessionId);

    // State machine guard — throw jika lifecycle tidak mengizinkan
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

    // Sequential validation: status → giliran → legalitas move
    this.validationService.validate(session, playerId, move, engine);

    const result = engine.executeTurn(session.currentState, move, session.emitter);
    session.currentState = result.newState;

    if (result.endResult.isOver) {
      session.finish(); // IN_PROGRESS → FINISHED, emit state.changed
    }

    return result;
  }

  /** Return current game state. Throw jika state belum ada. */
  async getState(sessionId: string): Promise<GameState> {
    const session = this.registry.get(sessionId);
    if (!session.currentState) {
      throw new NotFoundException('Game state belum diinisialisasi untuk sesi ini.');
    }
    return session.currentState;
  }

  /** Return full GameSession — digunakan oleh proxy untuk authorization check. */
  getSession(sessionId: string): GameSession {
    return this.registry.get(sessionId);
  }

  /** Selesaikan sesi secara paksa (host abort, timeout, dll). */
  async endSession(sessionId: string): Promise<void> {
    const session = this.registry.get(sessionId);
    session.finish();
  }

  /** List semua sesi aktif. */
  listSessions(): GameSession[] {
    return this.registry.getAll();
  }

  /**
   * Subscribe ke per-session emitter dan forward semua event ke global GameEventBus
   * dengan sessionId ditambahkan ke payload untuk WebSocket room routing.
   */
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
