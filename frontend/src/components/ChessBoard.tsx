'use client';

import { useState } from 'react';

const PIECE_SYMBOLS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

interface Props {
  board: string[][];
  onMove: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
  disabled: boolean;
  myPlayerId: string | null;
  currentPlayerId: string;
  playerOrder: string[];
}

export default function ChessBoard({ board, onMove, disabled, myPlayerId, currentPlayerId, playerOrder }: Props) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);

  const isMyTurn = myPlayerId === currentPlayerId;
  const myIndex = playerOrder.indexOf(myPlayerId ?? '');

  const handleClick = (row: number, col: number) => {
    if (disabled || !isMyTurn) return;

    const piece = board[row][col];

    if (!selected) {
      if (!piece) return;
      const isWhitePiece = piece === piece.toUpperCase() && piece !== '';
      const isMyPiece = myIndex === 0 ? isWhitePiece : !isWhitePiece;
      if (!isMyPiece) return;
      setSelected({ row, col });
    } else {
      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }
      onMove(selected, { row, col });
      setSelected(null);
    }
  };

  return (
    <div className="inline-block border-2 border-zinc-400 rounded overflow-hidden">
      {board.map((row, r) => (
        <div key={r} className="flex">
          <span className="w-6 flex items-center justify-center text-xs text-zinc-400 select-none bg-zinc-50">
            {8 - r}
          </span>
          {row.map((cell, c) => {
            const isLight = (r + c) % 2 === 0;
            const isSelected = selected?.row === r && selected?.col === c;
            const isWhitePiece = cell && cell === cell.toUpperCase();
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className={[
                  'w-10 h-10 flex items-center justify-center text-2xl',
                  isLight ? 'bg-zinc-100' : 'bg-zinc-400',
                  isSelected ? 'ring-2 ring-blue-500 ring-inset' : '',
                  !disabled && isMyTurn ? 'cursor-pointer hover:opacity-75' : 'cursor-default',
                ].join(' ')}
              >
                {cell ? (
                  <span
                    className={[
                      isWhitePiece ? 'text-zinc-900' : 'text-zinc-700',
                      'drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]',
                    ].join(' ')}
                  >
                    {PIECE_SYMBOLS[cell] ?? cell}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex ml-6 bg-zinc-50">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f) => (
          <span key={f} className="w-10 text-center text-xs text-zinc-400 select-none py-0.5">{f}</span>
        ))}
      </div>
    </div>
  );
}
