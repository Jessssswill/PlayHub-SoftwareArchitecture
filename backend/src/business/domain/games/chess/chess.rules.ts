import { BadRequestException } from '@nestjs/common';
import { GameState } from '../game-state';
import { ChessMove, EndCondition } from '../../../../shared/types/move.types';

export class ChessRules {
  static validate(state: GameState, move: ChessMove): void {
    const { from, to } = move;

    if (!ChessRules.inBounds(from.row, from.col) || !ChessRules.inBounds(to.row, to.col)) {
      throw new BadRequestException('Posisi move di luar papan 8x8.');
    }

    const piece = state.boardState[from.row][from.col];
    if (!piece) {
      throw new BadRequestException(`Tidak ada piece di (${from.row},${from.col}).`);
    }

    const isWhiteTurn = state.playerOrder[0] === move.playerId;
    const isWhitePiece = piece === piece.toUpperCase();
    if (isWhiteTurn !== isWhitePiece) {
      throw new BadRequestException('Kamu tidak bisa menggerakkan piece lawan.');
    }

    if (state.currentPlayerId !== move.playerId) {
      throw new BadRequestException(`Bukan giliran player '${move.playerId}'.`);
    }

    const target = state.boardState[to.row][to.col];
    if (target) {
      const isTargetWhite = target === target.toUpperCase();
      if (isWhiteTurn === isTargetWhite) {
        throw new BadRequestException('Tidak bisa capture piece sendiri.');
      }
    }

    if (!ChessRules.isValidPieceMove(state, move, isWhiteTurn)) {
      throw new BadRequestException(
        `Gerakan tidak valid untuk piece '${piece}' di (${from.row},${from.col}).`,
      );
    }
  }

  static apply(state: GameState, move: ChessMove): GameState {
    const newState = state.clone();
    const { from, to } = move;
    const captured = newState.boardState[to.row][to.col];

    newState.boardState[to.row][to.col] = newState.boardState[from.row][from.col];
    newState.boardState[from.row][from.col] = '';

    if (captured) {
      newState.capturedPieces.push(captured);
    }

    newState.moveCount += 1;
    newState.lastMoveTimestamp = Date.now();
    const currentIdx = state.playerOrder.indexOf(move.playerId);
    newState.currentPlayerId =
      state.playerOrder[(currentIdx + 1) % state.playerOrder.length];

    return newState;
  }

  static checkEnd(state: GameState): EndCondition {
    let whiteKing = false;
    let blackKing = false;

    for (const row of state.boardState) {
      for (const cell of row) {
        if (cell === 'K') whiteKing = true;
        if (cell === 'k') blackKing = true;
      }
    }

    if (!whiteKing) {
      return { isOver: true, winnerId: state.playerOrder[1] ?? null, isDraw: false };
    }
    if (!blackKing) {
      return { isOver: true, winnerId: state.playerOrder[0] ?? null, isDraw: false };
    }
    return { isOver: false, winnerId: null, isDraw: false };
  }

  private static inBounds(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  private static isValidPieceMove(
    state: GameState,
    move: ChessMove,
    isWhite: boolean,
  ): boolean {
    const piece = state.boardState[move.from.row][move.from.col].toUpperCase();
    switch (piece) {
      case 'P': return ChessRules.pawn(state, move, isWhite);
      case 'R': return ChessRules.rook(state, move);
      case 'N': return ChessRules.knight(move);
      case 'B': return ChessRules.bishop(state, move);
      case 'Q': return ChessRules.rook(state, move) || ChessRules.bishop(state, move);
      case 'K': return ChessRules.king(move);
      default: return false;
    }
  }

  private static pawn(state: GameState, move: ChessMove, isWhite: boolean): boolean {
    const { from, to } = move;
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);
    const target = state.boardState[to.row][to.col];

    if (colDiff === 0 && rowDiff === dir && !target) return true;

    if (
      colDiff === 0 &&
      rowDiff === 2 * dir &&
      from.row === startRow &&
      !state.boardState[from.row + dir][from.col] &&
      !target
    ) {
      return true;
    }

    if (colDiff === 1 && rowDiff === dir && target) return true;

    return false;
  }

  private static rook(state: GameState, move: ChessMove): boolean {
    const { from, to } = move;
    if (from.row !== to.row && from.col !== to.col) return false;
    return ChessRules.pathClear(state, from, to);
  }

  private static knight(move: ChessMove): boolean {
    const dr = Math.abs(move.to.row - move.from.row);
    const dc = Math.abs(move.to.col - move.from.col);
    return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
  }

  private static bishop(state: GameState, move: ChessMove): boolean {
    const dr = Math.abs(move.to.row - move.from.row);
    const dc = Math.abs(move.to.col - move.from.col);
    if (dr !== dc) return false;
    return ChessRules.pathClear(state, move.from, move.to);
  }

  private static king(move: ChessMove): boolean {
    const dr = Math.abs(move.to.row - move.from.row);
    const dc = Math.abs(move.to.col - move.from.col);
    return dr <= 1 && dc <= 1 && dr + dc > 0;
  }

  private static pathClear(
    state: GameState,
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    const rStep = Math.sign(to.row - from.row);
    const cStep = Math.sign(to.col - from.col);
    let r = from.row + rStep;
    let c = from.col + cStep;
    while (r !== to.row || c !== to.col) {
      if (state.boardState[r][c]) return false;
      r += rStep;
      c += cStep;
    }
    return true;
  }
}
