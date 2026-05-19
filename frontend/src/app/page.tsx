'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Gamepad2, Plus, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSessionList } from '../hooks/useGameApi';
import { GameSession, GameStatus, GameType } from '../lib/types';
import { tokens, transitions, btn, card } from '../lib/design-tokens';
import { LoadingState } from '../components/states/LoadingState';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { demoSession } from '../lib/api';

const STATUS_BADGE: Record<GameStatus, string> = {
  [GameStatus.WAITING]: 'bg-amber-50 text-amber-700 border border-amber-200',
  [GameStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border border-blue-200',
  [GameStatus.PAUSED]: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  [GameStatus.FINISHED]: 'bg-red-50 text-red-700 border border-red-200',
};

export default function LobbyPage() {
  const router = useRouter();
  const { sessions, loading, error, refetch } = useSessionList(3000);

  const active = sessions.filter((s) => s.status === GameStatus.IN_PROGRESS);
  const others = sessions.filter((s) => s.status !== GameStatus.IN_PROGRESS);

  const handleDemo = async () => {
    const toastId = toast.loading('Setting up demo…');
    try {
      const res = await demoSession();
      toast.success('Demo session ready!', { id: toastId });
      router.push(`/game/${res.sessionId}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Demo failed';
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${tokens.text}`}>Game Lobby</h1>
          <p className={`${tokens.textMuted} mt-1 text-sm`}>
            Sessions auto-refresh every 3 s
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/lobby" className={`${btn.primary} inline-flex items-center gap-1.5`}>
            <Plus className="w-4 h-4" />
            New Session
          </Link>
          <button
            onClick={handleDemo}
            className={`${btn.secondary} inline-flex items-center gap-1.5`}
          >
            <Zap className="w-4 h-4" />
            Try Demo Mode
          </button>
        </div>
      </div>

      {/* States */}
      {error ? (
        <ErrorState
          message={`${error} — is the backend running on :3001?`}
          onRetry={refetch}
        />
      ) : loading ? (
        <LoadingState message="Fetching sessions…" />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="No sessions yet"
          description="Create one to get started, or try Demo Mode for an instant game."
          cta={
            <Link href="/lobby" className={`${btn.primary} inline-flex items-center gap-1.5 text-sm`}>
              <Plus className="w-4 h-4" />
              Create Session
            </Link>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-3`}>
                Active ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map((s) => <SessionCard key={s.id} session={s} />)}
              </div>
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h2 className={`text-xs font-semibold ${tokens.textMuted} uppercase tracking-wider mb-3`}>
                Other ({others.length})
              </h2>
              <div className="space-y-2">
                {others.map((s) => <SessionCard key={s.id} session={s} />)}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function SessionCard({ session }: { session: GameSession }) {
  return (
    <Link
      href={`/game/${session.id}`}
      className={`block ${card} hover:border-blue-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl select-none">
            {session.gameType === GameType.TIC_TAC_TOE ? '⭕' : '♟'}
          </span>
          <div>
            <p className={`font-medium text-sm ${tokens.text}`}>
              {session.players.map((p) => p.name).join(' vs ')}
            </p>
            <p className={`text-xs ${tokens.textMuted}`}>
              {session.gameType === GameType.TIC_TAC_TOE ? 'Tic-Tac-Toe' : 'Chess'} ·{' '}
              {session.currentState?.moveCount ?? 0} moves
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[session.status]}`}>
          {session.status.replace('_', ' ')}
        </span>
      </div>
    </Link>
  );
}
