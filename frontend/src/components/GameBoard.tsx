'use client';

import { GameType, GameState } from '../lib/types';
import TicTacToeBoard from './TicTacToeBoard';
import ChessBoard from './ChessBoard';

interface Props {
  gameType: GameType;
  gameState: GameState;
  myPlayerId: string | null;
  onTicTacToeMove: (row: number, col: number) => void;
  onChessMove: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
  disabled: boolean;
}

export default function GameBoard({
  gameType,
  gameState,
  myPlayerId,
  onTicTacToeMove,
  onChessMove,
  disabled,
}: Props) {
  if (gameType === GameType.TIC_TAC_TOE) {
    return (
      <TicTacToeBoard
        board={gameState.boardState}
        onCellClick={onTicTacToeMove}
        disabled={disabled}
      />
    );
  }

  return (
    <ChessBoard
      board={gameState.boardState}
      onMove={onChessMove}
      disabled={disabled}
      myPlayerId={myPlayerId}
      currentPlayerId={gameState.currentPlayerId}
      playerOrder={gameState.playerOrder}
    />
  );
}
