/**
 * Generic board representation — dipakai oleh semua game type.
 * TCell adalah tipe per-cell: string untuk TicTacToe, Piece | null untuk Chess.
 */
export interface Board<TCell> {
  width: number;
  height: number;
  cells: TCell[][];
}
