'use client';

import { MoveRecord, Player } from '../lib/types';
import { tokens, card } from '../lib/design-tokens';

interface Props {
  history: MoveRecord[];
  players: Player[];
}

export default function MoveHistory({ history, players }: Props) {
  const getName = (id: string) => players.find((p) => p.id === id)?.name ?? id;

  return (
    <div className={card}>
      <h3 className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-3`}>
        Move History{history.length > 0 && ` (${history.length})`}
      </h3>
      {history.length === 0 ? (
        <p className={`text-sm ${tokens.textMuted} italic`}>No moves yet</p>
      ) : (
        <ol className="space-y-1 max-h-48 overflow-y-auto">
          {history.map((record, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={`${tokens.textMuted} w-5 text-right shrink-0`}>{i + 1}.</span>
              <span className={`font-medium ${tokens.text} shrink-0`}>{getName(record.playerId)}</span>
              <span className={`${tokens.textMuted} truncate`}>{record.description}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
