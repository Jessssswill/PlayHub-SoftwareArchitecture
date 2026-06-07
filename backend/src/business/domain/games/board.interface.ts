export interface Board<TCell> {
  width: number;
  height: number;
  cells: TCell[][];
}
