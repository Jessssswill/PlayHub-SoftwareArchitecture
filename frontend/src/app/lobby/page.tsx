'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { GameType } from '../../lib/types';
import { tokens, btn, transitions } from '../../lib/design-tokens';
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
        className={`inline-flex items-center gap-1 text-sm ${tokens.textMuted} hover:${tokens.text} ${transitions.default} mb-6`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lobby
      </Link>

      <h1 className={`text-xl font-bold ${tokens.text} mb-1`}>New Game Session</h1>
      <p className={`text-sm ${tokens.textMuted} mb-6`}>
        Both players share the same URL to play.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Game Type */}
        <div>
          <label className={`block text-sm font-medium ${tokens.text} mb-2`}>Game Type</label>
          <div className="grid grid-cols-2 gap-3">
            {([GameType.TIC_TAC_TOE, GameType.CHESS] as const).map((gt) => (
              <button
                type="button"
                key={gt}
                onClick={() => setGameType(gt)}
                className={`p-4 border-2 rounded-lg text-center transition-colors duration-150 ${
                  gameType === gt
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : `border-zinc-200 hover:border-zinc-300 ${tokens.bgCard}`
                }`}
              >
                <div className="text-3xl mb-1">{gt === GameType.TIC_TAC_TOE ? '⭕' : '♟'}</div>
                <div className={`text-sm font-medium ${tokens.text}`}>
                  {gt === GameType.TIC_TAC_TOE ? 'Tic-Tac-Toe' : 'Chess'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        {(['Player 1', 'Player 2'] as const).map((label, i) => (
          <div key={label}>
            <label className={`block text-sm font-medium ${tokens.text} mb-1`}>
              {label} Name <span className={tokens.danger}>*</span>
            </label>
            <input
              type="text"
              value={i === 0 ? p1Name : p2Name}
              onChange={(e) => (i === 0 ? setP1Name : setP2Name)(e.target.value)}
              placeholder={i === 0 ? 'e.g. Alice' : 'e.g. Bob'}
              required
              className={`w-full border ${tokens.border} rounded-lg px-3 py-2 text-sm ${tokens.text}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white placeholder:${tokens.textMuted}`}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting || !p1Name.trim() || !p2Name.trim()}
          className={`w-full py-2.5 ${btn.primary} text-center`}
        >
          {submitting ? 'Creating…' : 'Create Session'}
        </button>
      </form>
    </main>
  );
}
