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
      <div className="space-y-2">
        {players.map((player, i) => {
          const isCurrentTurn = player.id === currentPlayerId && status === GameStatus.IN_PROGRESS;
          const isWinner = player.id === winnerId;
          const isMe = player.id === myPlayerId;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                isWinner
                  ? 'bg-blue-50 border border-blue-200'
                  : isCurrentTurn
                    ? `bg-zinc-50 border ${tokens.border}`
                    : 'border border-transparent'
              }`}
            >
              <span className={`text-base ${i === 0 ? tokens.player1 : tokens.player2}`}>
                {i === 0 ? '●' : '●'}
              </span>
              <span className={`font-medium text-sm ${tokens.text}`}>
                {player.name}
                {isMe && <span className={`ml-1 text-xs ${tokens.textMuted}`}>(you)</span>}
              </span>
              {isCurrentTurn && (
                <span className={`ml-auto text-xs font-semibold ${tokens.accentText} animate-pulse`}>
                  ← turn
                </span>
              )}
              {isWinner && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <Trophy className="w-3.5 h-3.5" /> Winner
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
