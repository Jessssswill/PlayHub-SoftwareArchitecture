import { ConnectFourGame } from '../src/business/domain/games/connect-four/connect-four.game';
import { GameState } from '../src/business/domain/games/game-state';
import { ConnectFourRules } from '../src/business/domain/games/connect-four/connect-four.rules';
import { GameType } from '../src/shared/types/game-type.enum';
import { GameEventEmitter } from '../src/business/domain/events/game-event-emitter';

describe('Connect Four Game Logic', () => {
  let game: ConnectFourGame;
  let initialState: GameState;
  let emitter: GameEventEmitter;
  const p1 = 'p1';
  const p2 = 'p2';

  beforeEach(() => {
    game = new ConnectFourGame();
    emitter = new GameEventEmitter();
    initialState = new GameState({
      boardState: Array.from({ length: 6 }, () => Array(7).fill('')),
      currentPlayerId: p1,
      playerOrder: [p1, p2],
    });
  });

  it('valid move: drop biji ke kolom kosong jatuh ke baris paling bawah', () => {
    const { newState: state } = game.executeTurn(initialState, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 0 }, emitter);
    expect(state.boardState[5][0]).toBe('R');
    expect(state.currentPlayerId).toBe(p2);
  });

  it('gravity: biji jatuh ke baris paling bawah yang kosong di atas biji lain', () => {
    let { newState: state } = game.executeTurn(initialState, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 0 }, emitter);
    ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p2, col: 0 }, emitter));
    
    expect(state.boardState[5][0]).toBe('R');
    expect(state.boardState[4][0]).toBe('Y');
  });

  it('invalid move: kolom di luar range melempar error', () => {
    expect(game.isValidMove(initialState, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: -1 } as any)).toBe(false);
    expect(game.isValidMove(initialState, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 7 } as any)).toBe(false);
  });

  it('invalid move: kolom penuh melempar error', () => {
    let state = initialState;
    for (let i = 0; i < 6; i++) {
      const pid = i % 2 === 0 ? p1 : p2;
      ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: pid, col: 0 }, emitter));
    }
    
    expect(game.isValidMove(state, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 0 } as any)).toBe(false);
  });

  it('win horizontal: 4 biji R berjajar horizontal', () => {
    let state = initialState;
    for (let i = 0; i < 3; i++) {
      ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: i }, emitter));
      ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p2, col: i }, emitter));
    }
    const { endResult: result } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 3 }, emitter);

    expect(result.isOver).toBe(true);
    expect(result.winnerId).toBe(p1);
  });

  it('win vertikal: 4 biji Y berjajar vertikal', () => {
    let state = initialState;
    for (let i = 0; i < 3; i++) {
      ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 0 }, emitter));
      ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p2, col: 1 }, emitter));
    }
    ({ newState: state } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 2 }, emitter));
    const { endResult: result } = game.executeTurn(state, { gameType: GameType.CONNECT_FOUR, playerId: p2, col: 1 }, emitter);

    expect(result.isOver).toBe(true);
    expect(result.winnerId).toBe(p2);
  });

  it('win diagonal kanan-bawah (↘)', () => {
    let state = initialState;
    /*
      Layout target:
      ...
      ..R
      .RY
      RYY
      Baris r, c:
      (5,0)=R
      (5,1)=Y, (4,1)=R
      (5,2)=Y, (4,2)=Y, (3,2)=R
      (5,3)=Y, (4,3)=Y, (3,3)=Y, (2,3)=R -> Win diagonal
    */
    const moves = [
      {p: p1, c: 0}, // (5,0) R
      {p: p2, c: 1}, // (5,1) Y
      {p: p1, c: 1}, // (4,1) R
      {p: p2, c: 2}, // (5,2) Y
      {p: p1, c: 2}, // (4,2) R - wait, need (4,2) to be Y and (3,2) to be R
    ];
    // Re-do move sequence for diagonal win
    state.boardState[5][0] = 'R';
    state.boardState[5][1] = 'Y'; state.boardState[4][1] = 'R';
    state.boardState[5][2] = 'Y'; state.boardState[4][2] = 'Y'; state.boardState[3][2] = 'R';
    state.boardState[5][3] = 'Y'; state.boardState[4][3] = 'Y'; state.boardState[3][3] = 'Y'; state.boardState[2][3] = 'R';

    const result = game.checkEndCondition(state);
    expect(result.isOver).toBe(true);
    expect(result.winnerId).toBe(p1);
  });

  it('win diagonal kiri-bawah (↙)', () => {
    let state = initialState;
    /*
      (5,3)=R
      (5,2)=Y, (4,2)=R
      (5,1)=Y, (4,1)=Y, (3,1)=R
      (5,0)=Y, (4,0)=Y, (3,0)=Y, (2,0)=R -> Win diagonal
    */
    state.boardState[5][3] = 'R';
    state.boardState[5][2] = 'Y'; state.boardState[4][2] = 'R';
    state.boardState[5][1] = 'Y'; state.boardState[4][1] = 'Y'; state.boardState[3][1] = 'R';
    state.boardState[5][0] = 'Y'; state.boardState[4][0] = 'Y'; state.boardState[3][0] = 'Y'; state.boardState[2][0] = 'R';

    const result = game.checkEndCondition(state);
    expect(result.isOver).toBe(true);
    expect(result.winnerId).toBe(p1);
  });

  it('draw: board penuh tanpa pemenang', () => {
    let state = initialState;
    // Fill board with pattern that avoids 4 in a row
    // Pattern: R R Y Y R R Y
    //          Y Y R R Y Y R
    // This pattern avoids 4 in a row horizontal and vertical.
    // Let's use a very safe pattern.
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        // pattern: (c % 4 < 2) XOR (r % 2 === 0)
        const val = (c % 4 < 2);
        const rowEven = (r % 2 === 0);
        state.boardState[r][c] = (val !== rowEven) ? 'R' : 'Y';
      }
    }
    
    // Check if there is really no win
    expect(ConnectFourRules.checkWin(state.boardState, 'R')).toBe(false);
    expect(ConnectFourRules.checkWin(state.boardState, 'Y')).toBe(false);
    expect(ConnectFourRules.isBoardFull(state.boardState)).toBe(true);

    const result = game.checkEndCondition(state);
    expect(result.isOver).toBe(true);
    expect(result.isDraw).toBe(true);
  });

  it('immutability: applyMove tidak mutate state asli', () => {
    game.executeTurn(initialState, { gameType: GameType.CONNECT_FOUR, playerId: p1, col: 0 }, emitter);
    expect(initialState.boardState[5][0]).toBe('');
  });
});
