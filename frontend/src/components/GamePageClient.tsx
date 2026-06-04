'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Trophy, Minus } from 'lucide-react';
import { useGameStore } from '../lib/store';
import { useGameSocket } from '../hooks/useGameSocket';
import { GameStatus, GameType } from '../lib/types';
import * as api from '../lib/api';
import { tokens, transitions, btn, card } from '../lib/design-tokens';
import GameBoard from './GameBoard';
import PlayerList from './PlayerList';
import MoveHistory from './MoveHistory';
import { LoadingState } from './states/LoadingState';
import { ErrorState } from './states/ErrorState';

interface Props {
  sessionId: string;
}

export default function GamePageClient({ sessionId }: Props) {
  const router = useRouter();
  const { currentSession, gameState, moveHistory, myPlayerId, endResult, setSession, setMyPlayerId } =
    useGameStore();

  // Re-fetch state dari server — dipakai setelah WS join confirm + periodic fallback
  const syncState = useCallback(async () => {
    try {
      const sessions = await api.getSessions();
      const session = sessions.find((s) => s.id === sessionId);
      if (session) setSession(session);
    } catch {
      // silent — polling fallback, jangan ganggu UX
    }
  }, [sessionId, setSession]);

  // Initial load — juga set myPlayerId dari sessionStorage
  useEffect(() => {
    const load = async () => {
      try {
        const sessions = await api.getSessions();
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) {
          toast.error('Session not found');
          router.push('/');
          return;
        }
        setSession(session);
        const stored = sessionStorage.getItem(`player-id-${sessionId}`);
        if (stored) setMyPlayerId(stored);
      } catch {
        toast.error('Failed to load session. Backend running on :3001?');
      }
    };
    load();
  }, [sessionId, setSession, setMyPlayerId, router]);

  // Polling fallback setiap 5 detik — backup kalau WS event terlewat
  const syncRef = useRef(syncState);
  useEffect(() => { syncRef.current = syncState; });
  useEffect(() => {
    const interval = setInterval(() => syncRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  // Pass syncState sebagai callback: dipanggil setelah socket confirm join room
  useGameSocket(sessionId, syncState);

  const handleSelectPlayer = (playerId: string) => {
    setMyPlayerId(playerId);
    sessionStorage.setItem(`player-id-${sessionId}`, playerId);
  };

  const submitMove = useCallback(
    async (moveData: Record<string, unknown>) => {
      if (!myPlayerId) return;
      try {
        await api.makeMove(sessionId, myPlayerId, moveData);
      } catch (e: unknown) {
        const axiosMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        const msg = axiosMsg ?? (e instanceof Error ? e.message : 'Move failed');
        toast.error(typeof msg === 'string' ? msg : 'Move failed');
      }
    },
    [sessionId, myPlayerId],
  );

  const handleTTTMove = (row: number, col: number) => {
    submitMove({ gameType: GameType.TIC_TAC_TOE, playerId: myPlayerId, row, col });
  };

  const handleChessMove = (from: { row: number; col: number }, to: { row: number; col: number }) => {
    submitMove({ gameType: GameType.CHESS, playerId: myPlayerId, from, to });
  };

  const handleConnectFourMove = (col: number) => {
    submitMove({ gameType: GameType.CONNECT_FOUR, playerId: myPlayerId, col });
  };

  if (!currentSession) {
    return (
      <main className={`max-w-3xl mx-auto px-4 py-16`}>
        <LoadingState message="Loading session…" />
      </main>
    );
  }

  if (!gameState) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          message="Game state unavailable — waiting for sync…"
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  const isMyTurn = gameState.currentPlayerId === myPlayerId;
  const isFinished = currentSession.status === GameStatus.FINISHED;
  const boardDisabled = !isMyTurn || isFinished;

  const winner = endResult?.winnerId
    ? currentSession.players.find((p) => p.id === endResult.winnerId)
    : null;

  const statusBadge =
    currentSession.status === GameStatus.IN_PROGRESS
      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
      : currentSession.status === GameStatus.FINISHED
        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        : currentSession.status === GameStatus.PAUSED
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/"
            className={`inline-flex items-center gap-1 text-sm ${tokens.textMuted} hover:${tokens.text} ${transitions.default} mb-1`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Lobby
          </Link>
          <h1 className={`text-xl font-bold ${tokens.text}`}>
            {currentSession.gameType === GameType.TIC_TAC_TOE 
              ? 'Tic-Tac-Toe' 
              : currentSession.gameType === GameType.CONNECT_FOUR
                ? 'Connect Four'
                : 'Chess'}
          </h1>
          <p className={`text-xs font-mono ${tokens.textMuted}`}>{sessionId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}`}>
          {currentSession.status.replace('_', ' ')}
        </span>
      </div>

      {/* Player identity selector */}
      {!myPlayerId && (
        <div className={`mb-6 p-4 ${card} border-zinc-300 dark:border-zinc-700`}>
          <p className={`text-sm font-medium ${tokens.text} mb-3`}>Who are you?</p>
          <div className="flex gap-3 flex-wrap">
            {currentSession.players.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPlayer(p.id)}
                className={btn.secondary + ' text-sm'}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={() => handleSelectPlayer('spectator')}
              className={`${btn.secondary} text-sm ${tokens.textMuted}`}
            >
              Spectate
            </button>
          </div>
        </div>
      )}

      {/* Game over banner */}
      {(isFinished || endResult) && (
        <div
          className={`mb-6 p-4 rounded-xl border text-center ${
            endResult?.isDraw
              ? `bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-700 ${tokens.textMuted}`
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}
        >
          {endResult?.isDraw ? (
            <p className="text-base font-semibold flex items-center justify-center gap-2">
              <Minus className="w-5 h-5" /> Draw!
            </p>
          ) : winner ? (
            <p className="text-base font-semibold flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" /> {winner.name} wins!
            </p>
          ) : (
            <p className="text-base font-semibold">Game Over</p>
          )}
        </div>
      )}

      {/* Turn indicator */}
      {!isFinished && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 border ${
            isMyTurn
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : `bg-zinc-50 dark:bg-zinc-900/40 border ${tokens.border} ${tokens.textMuted}`
          }`}
        >
          {isMyTurn ? (
            <>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              Your turn — click to move
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Waiting for{' '}
              {currentSession.players.find((p) => p.id === gameState.currentPlayerId)?.name ?? '…'}
            </>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0">
          <GameBoard
            gameType={currentSession.gameType}
            gameState={gameState}
            myPlayerId={myPlayerId}
            onTicTacToeMove={handleTTTMove}
            onChessMove={handleChessMove}
            onConnectFourMove={handleConnectFourMove}
            disabled={boardDisabled}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <PlayerList
            players={currentSession.players}
            currentPlayerId={gameState.currentPlayerId}
            myPlayerId={myPlayerId}
            status={currentSession.status}
            winnerId={endResult?.winnerId}
          />
          <MoveHistory history={moveHistory} players={currentSession.players} />
          <div className={`${card} text-sm space-y-1`}>
            <p className={`font-medium ${tokens.text}`}>Session Info</p>
            <p className={tokens.textMuted}>Moves: {gameState.moveCount}</p>
            <p className={tokens.textMuted}>Game: {currentSession.gameType}</p>
            {myPlayerId && myPlayerId !== 'spectator' && (
              <p className={tokens.textMuted}>
                You: {currentSession.players.find((p) => p.id === myPlayerId)?.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
