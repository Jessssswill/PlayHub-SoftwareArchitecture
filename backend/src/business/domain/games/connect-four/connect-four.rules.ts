export class ConnectFourRules {
  static readonly ROWS = 6;
  static readonly COLS = 7;

  static isValidColumn(board: string[][], col: number): boolean {
    if (col < 0 || col >= this.COLS) return false;
    // Cek apakah kolom sudah penuh (baris paling atas indeks 0)
    return board[0][col] === '';
  }

  static dropPiece(board: string[][], col: number, piece: string): number {
    // Cari baris terbawah yang kosong
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (board[r][col] === '') {
        board[r][col] = piece;
        return r;
      }
    }
    return -1;
  }

  static checkWin(board: string[][], piece: string): boolean {
    const rows = this.ROWS;
    const cols = this.COLS;

    // Horizontal
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (
          board[r][c] === piece &&
          board[r][c + 1] === piece &&
          board[r][c + 2] === piece &&
          board[r][c + 3] === piece
        ) {
          return true;
        }
      }
    }

    // Vertikal
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c < cols; c++) {
        if (
          board[r + 1] &&
          board[r + 2] &&
          board[r + 3] &&
          board[r][c] === piece &&
          board[r + 1][c] === piece &&
          board[r + 2][c] === piece &&
          board[r + 3][c] === piece
        ) {
          return true;
        }
      }
    }

    // Diagonal kanan-bawah (↘)
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (
          board[r + 1] &&
          board[r + 2] &&
          board[r + 3] &&
          board[r][c] === piece &&
          board[r + 1][c + 1] === piece &&
          board[r + 2][c + 2] === piece &&
          board[r + 3][c + 3] === piece
        ) {
          return true;
        }
      }
    }

    // Diagonal kiri-bawah (↙)
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 3; c < cols; c++) {
        if (
          board[r + 1] &&
          board[r + 2] &&
          board[r + 3] &&
          board[r][c] === piece &&
          board[r + 1][c - 1] === piece &&
          board[r + 2][c - 2] === piece &&
          board[r + 3][c - 3] === piece
        ) {
          return true;
        }
      }
    }

    return false;
  }

  static isBoardFull(board: string[][]): boolean {
    // Jika baris paling atas penuh semua, berarti board penuh
    return board[0].every((cell) => cell !== '');
  }
}
