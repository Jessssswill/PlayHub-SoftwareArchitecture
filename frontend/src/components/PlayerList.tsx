'use client';

import { Trophy } from 'lucide-react';
import { Player, GameStatus } from '../lib/types';
import { tokens, card } from '../lib/design-tokens';

interface Props {
  players: Player[];
  currentPlayerId: string | undefined;
  myPlayerId: string | null;
  status: GameStatus;
  winnerId?: string | null;
}

export default function PlayerList({ players, currentPlayerId, myPlayerId, status, winnerId }: Props) {
  return (
    <div className={card}>
      <h3 className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-3`}>Players</h3>
      <div className="space-y-1.5">
        {players.map((player, i) => {
          const isCurrentTurn = player.id === currentPlayerId && status === GameStatus.IN_PROGRESS;
          const isWinner = player.id === winnerId;
          const isMe = player.id === myPlayerId;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-150 ${
                isWinner
                  ? 'bg-blue-950 border border-blue-800'
                  : isCurrentTurn
                    ? 'bg-slate-700 border border-slate-600'
                    : 'border border-transparent'
              }`}
            >
              {/* Player color dot */}
              <span className={`text-sm leading-none ${i === 0 ? tokens.player1 : tokens.player2}`}>●</span>

              <span className={`font-medium text-sm ${tokens.text} flex-1 truncate`}>
                {player.name}
                {isMe && <span className={`ml-1 text-xs ${tokens.textMuted}`}>(you)</span>}
              </span>

              {/* Current turn: pulsing dot */}
              {isCurrentTurn && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
              )}

              {/* Winner badge */}
              {isWinner && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 shrink-0">
                  <Trophy className="w-3 h-3" /> Winner
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
