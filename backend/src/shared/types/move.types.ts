import { GameType } from './game-type.enum';

export interface TicTacToeMove {
  gameType: GameType.TIC_TAC_TOE;
  playerId: string;
  row: number;
  col: number;
}

export interface ChessMove {
  gameType: GameType.CHESS;
  playerId: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export interface ConnectFourMove {
  gameType: GameType.CONNECT_FOUR;
  playerId: string;
  col: number;
}

/** Discriminated union — TypeScript menyempitkan tipe secara otomatis via gameType. */
export type Move = TicTacToeMove | ChessMove | ConnectFourMove;

export interface EndCondition {
  isOver: boolean;
  /** null = draw atau game belum selesai */
  winnerId: string | null;
  isDraw: boolean;
}
