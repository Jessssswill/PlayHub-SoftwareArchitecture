import { BadRequestException } from '@nestjs/common';
import { MoveValidationService } from '../src/business/services/move-validation.service';
import { GameSession } from '../src/business/domain/game-session';
import { GameState } from '../src/business/domain/games/game-state';
import { TicTacToeGame } from '../src/business/domain/games/tic-tac-toe/tic-tac-toe.game';
import { GameType } from '../src/shared/types/game-type.enum';
import { GameStatus } from '../src/shared/types/game-status.enum';
import { TicTacToeMove } from '../src/shared/types/move.types';

const P1 = 'player-1';
const P2 = 'player-2';

const makeSession = (status: GameStatus = GameStatus.IN_PROGRESS): GameSession => {
  const session = new GameSession({
    id: 'test-session',
    gameType: GameType.TIC_TAC_TOE,
    players: [
      { id: P1, name: 'Alice' },
      { id: P2, name: 'Bob' },
    ],
    status,
    currentState: new GameState({
      boardState: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      currentPlayerId: P1,
      playerOrder: [P1, P2],
    }),
    createdAt: new Date(),
    timeControlSeconds: 0,
    isPrivate: false,
    allowSpectators: true,
    maxSpectators: 10,
  });
  // Force status to match requested value (bypassing state machine for test setup)
  (session as any).status = status;
  return session;
};

const validMove = (playerId: string = P1): TicTacToeMove => ({
  gameType: GameType.TIC_TAC_TOE,
  playerId,
  row: 0,
  col: 0,
});

describe('MoveValidationService', () => {
  let service: MoveValidationService;
  let engine: TicTacToeGame;

  beforeEach(() => {
    service = new MoveValidationService();
    engine = new TicTacToeGame();
  });

  // ── Check 1: Game harus IN_PROGRESS ────────────────────────────────────────

  it('throw BadRequestException jika status WAITING', () => {
    const session = makeSession(GameStatus.WAITING);
    expect(() => service.validate(session, P1, validMove(), engine)).toThrow(
      BadRequestException,
    );
  });

  it('throw BadRequestException jika status PAUSED', () => {
    const session = makeSession(GameStatus.PAUSED);
    expect(() => service.validate(session, P1, validMove(), engine)).toThrow(
      BadRequestException,
    );
  });

  it('throw BadRequestException jika status FINISHED', () => {
    const session = makeSession(GameStatus.FINISHED);
    expect(() => service.validate(session, P1, validMove(), engine)).toThrow(
      BadRequestException,
    );
  });

  it('pesan error mencantumkan "Game tidak sedang berjalan" saat bukan IN_PROGRESS', () => {
    const session = makeSession(GameStatus.WAITING);
    expect(() => service.validate(session, P1, validMove(), engine)).toThrow(
      'Game tidak sedang berjalan',
    );
  });

  // ── Check 2: Player harus giliran ──────────────────────────────────────────

  it('throw BadRequestException jika bukan giliran player', () => {
    const session = makeSession(); // currentPlayerId = P1
    expect(() => service.validate(session, P2, validMove(P2), engine)).toThrow(
      BadRequestException,
    );
  });

  it('pesan error mencantumkan "Bukan giliran Anda" saat salah giliran', () => {
    const session = makeSession();
    expect(() => service.validate(session, P2, validMove(P2), engine)).toThrow(
      'Bukan giliran Anda',
    );
  });

  // ── Check 3: Move harus legal ──────────────────────────────────────────────

  it('throw BadRequestException jika move di luar batas papan', () => {
    const session = makeSession();
    const outOfBounds: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: P1,
      row: 5,
      col: 5,
    };
    expect(() => service.validate(session, P1, outOfBounds, engine)).toThrow(
      BadRequestException,
    );
  });

  it('throw BadRequestException jika sel sudah terisi', () => {
    const session = makeSession();
    if (session.currentState) {
      session.currentState.boardState[0][0] = 'X'; // sudah terisi
    }
    expect(() => service.validate(session, P1, validMove(), engine)).toThrow(
      BadRequestException,
    );
  });

  it('pesan error mencantumkan "Move tidak valid" saat move illegal', () => {
    const session = makeSession();
    if (session.currentState) {
      session.currentState.boardState[0][0] = 'X';
    }
    expect(() => service.validate(session, P1, validMove(), engine)).toThrow(
      'Move tidak valid',
    );
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('tidak throw saat move valid, giliran benar, dan status IN_PROGRESS', () => {
    const session = makeSession();
    expect(() => service.validate(session, P1, validMove(), engine)).not.toThrow();
  });

  it('tidak throw untuk move di pojok kanan bawah (row=2, col=2)', () => {
    const session = makeSession();
    const cornerMove: TicTacToeMove = {
      gameType: GameType.TIC_TAC_TOE,
      playerId: P1,
      row: 2,
      col: 2,
    };
    expect(() => service.validate(session, P1, cornerMove, engine)).not.toThrow();
  });
});
