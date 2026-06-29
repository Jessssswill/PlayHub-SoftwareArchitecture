import { GameState } from '../src/business/domain/games/game-state';

describe('Prototype - GameState.clone()', () => {
  const makeState = (): GameState =>
    new GameState({
      boardState: [
        ['X', '', 'O'],
        ['', 'X', ''],
        ['', '', ''],
      ],
      currentPlayerId: 'p1',
      moveCount: 3,
      lastMoveTimestamp: 1700000000000,
      capturedPieces: ['p', 'P'],
    });

  it('clone() menghasilkan object berbeda (bukan referensi sama)', () => {
    const original = makeState();
    const cloned = original.clone();
    expect(cloned).not.toBe(original);
  });

  it('clone() menyalin nilai primitive dengan benar', () => {
    const original = makeState();
    const cloned = original.clone();
    expect(cloned.currentPlayerId).toBe(original.currentPlayerId);
    expect(cloned.moveCount).toBe(original.moveCount);
    expect(cloned.lastMoveTimestamp).toBe(original.lastMoveTimestamp);
  });

  it('clone() boardState adalah deep copy - mutasi clone tidak mengubah original', () => {
    const original = makeState();
    const cloned = original.clone();

    // Ubah cell di clone
    cloned.boardState[0][0] = 'MODIFIED';

    // Original tidak boleh berubah
    expect(original.boardState[0][0]).toBe('X');
  });

  it('clone() boardState bukan referensi array yang sama', () => {
    const original = makeState();
    const cloned = original.clone();
    expect(cloned.boardState).not.toBe(original.boardState);
    expect(cloned.boardState[0]).not.toBe(original.boardState[0]);
  });

  it('clone() capturedPieces adalah copy - mutasi tidak memengaruhi original', () => {
    const original = makeState();
    const cloned = original.clone();

    cloned.capturedPieces.push('N');

    expect(original.capturedPieces).toHaveLength(2);
    expect(cloned.capturedPieces).toHaveLength(3);
  });

  it('clone() state bisa di-clone lagi (chaining clone)', () => {
    const original = makeState();
    const cloned1 = original.clone();
    const cloned2 = cloned1.clone();

    cloned2.boardState[1][1] = 'CHANGED';
    expect(cloned1.boardState[1][1]).toBe('X');
    expect(original.boardState[1][1]).toBe('X');
  });
});
