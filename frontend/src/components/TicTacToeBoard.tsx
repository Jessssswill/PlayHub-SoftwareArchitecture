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
              w-24 h-24 aspect-square border-2 rounded-lg flex items-center justify-center
              text-5xl font-bold transition-colors duration-150
              ${cell ? `${tokens.bgCard} ${tokens.border} cursor-default` : ''}
              ${!cell && !disabled ? `border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer ${tokens.bgCard}` : ''}
              ${!cell && disabled ? `${tokens.border} ${tokens.bgCard} cursor-default` : ''}
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
