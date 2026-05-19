'use client';

import { tokens } from '../lib/design-tokens';

interface Props {
  board: string[][];
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

export default function TicTacToeBoard({ board, onCellClick, disabled }: Props) {
  return (
    <div className="inline-grid grid-cols-3 gap-2">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => !disabled && !cell && onCellClick(r, c)}
            disabled={disabled || !!cell}
            className={`
              w-24 h-24 aspect-square border-2 rounded-xl flex items-center justify-center
              text-5xl font-bold transition-all duration-150
              ${cell ? 'bg-slate-800 border-slate-600 cursor-default' : ''}
              ${!cell && !disabled
                ? 'bg-slate-700 border-slate-600 hover:border-blue-500 hover:bg-slate-600 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] cursor-pointer'
                : ''}
              ${!cell && disabled ? 'bg-slate-800 border-slate-700 opacity-60 cursor-default' : ''}
            `}
          >
            {cell && (
              <span className={cell === 'X' ? tokens.player1 : tokens.player2}>{cell}</span>
            )}
          </button>
        )),
      )}
    </div>
  );
}
