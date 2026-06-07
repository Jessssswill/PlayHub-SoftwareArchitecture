"use client";

import { tokens } from "../lib/design-tokens";

interface Props {
  board: string[][];
  onColClick: (col: number) => void;
  disabled: boolean;
  currentPiece: "R" | "Y" | null;
}

export default function ConnectFourBoard({
  board,
  onColClick,
  disabled,
  currentPiece,
}: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-4 ${tokens.bgCard} p-6 rounded-xl shadow-2xl border ${tokens.border}`}
    >
      <div className="grid grid-cols-7 gap-2 w-full max-w-[500px]">
        {Array.from({ length: 7 }).map((_, colIndex) => (
          <button
            key={colIndex}
            onClick={() => onColClick(colIndex)}
            disabled={disabled || board[0][colIndex] !== ""}
            className={`
              h-10 rounded-t-lg transition-all duration-200 flex items-center justify-center text-sm font-bold
              ${
                disabled || board[0][colIndex] !== ""
                  ? "bg-zinc-200 dark:bg-zinc-700 opacity-50 cursor-not-allowed"
                  : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500 active:scale-95 group cursor-pointer"
              }
            `}
            title={`Drop in column ${colIndex + 1}`}
          >
            <span
              className={`
              transform transition-transform group-hover:translate-y-1
              ${currentPiece === "R" ? "text-red-500" : "text-amber-400"}
            `}
            >
              v
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 p-3 bg-blue-700 rounded-lg shadow-inner border-4 border-blue-800 w-full max-w-[500px]">
        {board.map((row, rowIndex) => (
          <>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square bg-blue-600 rounded-lg flex items-center justify-center p-1 relative"
              >
                <div className="absolute inset-1 rounded-full bg-blue-900/30 shadow-inner" />
                <div
                  className={`
                    w-full h-full rounded-full transition-all duration-500 transform
                    ${cell === "R" ? "bg-red-500 scale-100 shadow-lg" : ""}
                    ${cell === "Y" ? "bg-amber-400 scale-100 shadow-lg" : ""}
                    ${cell === "" ? "bg-zinc-300 dark:bg-zinc-700 scale-90" : ""}
                  `}
                />
              </div>
            ))}
          </>
        ))}
      </div>

      <div className="flex gap-6 mt-2 text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
          <span className={tokens.textMuted}>Player 1 (Red)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-400 shadow-sm" />
          <span className={tokens.textMuted}>Player 2 (Yellow)</span>
        </div>
      </div>
    </div>
  );
}
