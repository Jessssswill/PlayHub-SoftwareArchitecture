'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Gamepad2, Plus, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSessionList } from '../hooks/useGameApi';
import { GameSession, GameStatus, GameType } from '../lib/types';
import { tokens, btn } from '../lib/design-tokens';
import { LoadingState } from '../components/states/LoadingState';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { demoSession } from '../lib/api';

const STATUS_BADGE: Record<GameStatus, string> = {
  [GameStatus.WAITING]: 'bg-amber-950 text-amber-300 border border-amber-800',
  [GameStatus.IN_PROGRESS]: 'bg-blue-950 text-blue-300 border border-blue-800',
  [GameStatus.PAUSED]: 'bg-slate-700 text-slate-300 border border-slate-600',
  [GameStatus.FINISHED]: 'bg-slate-800 text-slate-400 border border-slate-700',
};

const GAME_ICON_BG: Record<GameType, string> = {
  [GameType.TIC_TAC_TOE]: 'bg-blue-950 border border-blue-900',
  [GameType.CHESS]: 'bg-slate-900 border border-slate-700',
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
      <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-200">
              Game Lobby
            </span>
          </h1>
          <p className={`${tokens.textMuted} text-sm`}>
            Sessions auto-refresh every 3 s
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/lobby" className={`${btn.primary} inline-flex items-center gap-1.5 text-sm`}>
            <Plus className="w-4 h-4" />
            New Session
          </Link>
          <button
            onClick={handleDemo}
            className={`${btn.secondary} inline-flex items-center gap-1.5 text-sm`}
          >
            <Zap className="w-4 h-4" />
            Demo Mode
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
  const isActive = session.status === GameStatus.IN_PROGRESS;
  return (
    <Link
      href={`/game/${session.id}`}
      className="block group"
    >
      <div className={`relative overflow-hidden bg-slate-800 border rounded-xl p-4
        transition-all duration-200 shadow-sm shadow-black/30
        ${isActive
          ? 'border-slate-600 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.10)]'
          : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        {/* Left accent bar for active sessions */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-l-xl" />
        )}

        <div className={`flex items-center justify-between ${isActive ? 'pl-2' : ''}`}>
          <div className="flex items-center gap-3">
            {/* Game icon badge */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${GAME_ICON_BG[session.gameType]}`}>
              {session.gameType === GameType.TIC_TAC_TOE ? '⭕' : '♟'}
            </div>
            <div>
              <p className={`font-semibold text-sm ${tokens.text}`}>
                {session.players.map((p) => p.name).join(' vs ')}
              </p>
              <p className={`text-xs ${tokens.textMuted}`}>
                {session.gameType === GameType.TIC_TAC_TOE ? 'Tic-Tac-Toe' : 'Chess'} ·{' '}
                {session.currentState?.moveCount ?? 0} moves
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[session.status]}`}>
              {session.status.replace('_', ' ')}
            </span>
            <ChevronRight className={`w-4 h-4 ${tokens.textMuted} opacity-0 group-hover:opacity-100 transition-opacity duration-150`} />
          </div>
        </div>
      </div>
    </Link>
  );
}
