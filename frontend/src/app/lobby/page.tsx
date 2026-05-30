'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { GameType } from '../../lib/types';
import { tokens, btn, transitions, card } from '../../lib/design-tokens';
import { createSession } from '../../lib/api';

export default function LobbyCreatePage() {
  const router = useRouter();
  const [gameType, setGameType] = useState<GameType>(GameType.TIC_TAC_TOE);
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1Name.trim() || !p2Name.trim()) return;
    setSubmitting(true);

    const toastId = toast.loading('Creating session…');
    const p1Id = `player-${Date.now()}-1`;
    const p2Id = `player-${Date.now()}-2`;

    try {
      const session = await createSession(gameType, [
        { id: p1Id, name: p1Name.trim() },
        { id: p2Id, name: p2Name.trim() },
      ]);
      sessionStorage.setItem(`player-id-${session.id}`, p1Id);
      toast.success('Session created!', { id: toastId });
      router.push(`/game/${session.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create session';
      toast.error(msg, { id: toastId });
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 text-sm ${tokens.textMuted} hover:text-slate-100 ${transitions.default} mb-8`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lobby
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-200">
            New Game Session
          </span>
        </h1>
        <p className={`text-sm ${tokens.textMuted}`}>
          Both players share the same URL to play.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Game Type */}
        <div>
          <label className={`block text-sm font-medium ${tokens.text} mb-2`}>Game Type</label>
          <div className="grid grid-cols-3 gap-3">
            {([GameType.TIC_TAC_TOE, GameType.CHESS, GameType.CONNECT_FOUR] as const).map((gt) => (
              <button
                type="button"
                key={gt}
                onClick={() => setGameType(gt)}
                className={`p-4 border-2 rounded-lg text-center transition-colors duration-150 ${
                  gameType === gt
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : `${tokens.border} hover:border-zinc-300 dark:hover:border-zinc-600 ${tokens.bgCard}`
                }`}
              >
                <div className="text-3xl mb-1">
                  {gt === GameType.TIC_TAC_TOE ? '⭕' : gt === GameType.CONNECT_FOUR ? '🔴' : '♟'}
                </div>
                <div className={`text-sm font-medium ${tokens.text}`}>
                  {gt === GameType.TIC_TAC_TOE ? 'Tic-Tac-Toe' : gt === GameType.CONNECT_FOUR ? 'Connect Four' : 'Chess'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700" />

        {/* Player Names */}
        {(['Player 1', 'Player 2'] as const).map((label, i) => (
          <div key={label}>
            <label className={`block text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-2`}>
              {label} Name <span className={tokens.danger}>*</span>
            </label>
            <input
              type="text"
              value={i === 0 ? p1Name : p2Name}
              onChange={(e) => (i === 0 ? setP1Name : setP2Name)(e.target.value)}
              placeholder={i === 0 ? 'e.g. Alice' : 'e.g. Bob'}
              required
              className={`w-full border ${tokens.border} rounded-xl px-3 py-2.5 text-sm ${tokens.text}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-slate-900 placeholder:text-slate-600 transition-colors duration-150`}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting || !p1Name.trim() || !p2Name.trim()}
          className={`w-full py-2.5 ${btn.primary} text-center text-sm`}
        >
          {submitting ? 'Creating…' : 'Create Session'}
        </button>
      </form>
    </main>
  );
}
