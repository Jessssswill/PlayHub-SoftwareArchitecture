import { Board } from '../domain/games/board.interface';
import { GameState } from '../domain/games/game-state';

/** Stub rules interface — diisi detail di Prompt 3. */
export interface GameRules {
  readonly name: string;
}

/**
 * @pattern Abstract Factory
 * @intent Memungkinkan penambahan game type baru tanpa modify code yang sudah ada.
 *         Tiap factory bertanggung jawab membuat satu set lengkap komponen
 *         (Board, Rules, InitialState) untuk satu jenis game.
 * @participants GameFactory (AbstractFactory), ChessFactory, TicTacToeFactory
 *               (ConcreteFactory), Board, GameRules, GameState (Products)
 */
export interface IGameFactory {
  /** Buat papan kosong sesuai dimensi game ini. */
  createBoard(): Board<string>;

  /** Buat rules object yang tahu aturan game ini. */
  createRules(): GameRules;

  /** Buat GameState awal sebelum game dimulai. */
  createInitialState(playerIds: [string, string]): GameState;
}
