'use client';

import { GameType, GameState } from '../lib/types';
import TicTacToeBoard from './TicTacToeBoard';
import ChessBoard from './ChessBoard';
import ConnectFourBoard from './ConnectFourBoard';

interface Props {
  gameType: GameType;
  gameState: GameState;
  myPlayerId: string | null;
  onTicTacToeMove: (row: number, col: number) => void;
  onChessMove: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
  onConnectFourMove: (col: number) => void;
  disabled: boolean;
}

export default function GameBoard({
  gameType,
  gameState,
  myPlayerId,
  onTicTacToeMove,
  onChessMove,
  onConnectFourMove,
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

  if (gameType === GameType.CONNECT_FOUR) {
    const isMyTurn = myPlayerId === gameState.currentPlayerId;
    const myPiece = myPlayerId === gameState.playerOrder[0] ? 'R' : 'Y';

    return (
      <ConnectFourBoard
        board={gameState.boardState}
        onColClick={onConnectFourMove}
        disabled={disabled || !isMyTurn}
        currentPiece={myPiece as 'R' | 'Y'}
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
