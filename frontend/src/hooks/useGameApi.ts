'use client';

import { useEffect, useState, useCallback } from 'react';
import * as api from '../lib/api';
import { GameSession, GameType, Player } from '../lib/types';

export const useSessionList = (pollInterval = 3000) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      setError(null);
    } catch {
      setError('Gagal memuat sesi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, pollInterval);
    return () => clearInterval(interval);
  }, [fetchSessions, pollInterval]);

  return { sessions, loading, error, refetch: fetchSessions };
};

export const useCreateSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (gameType: GameType, players: [Player, Player]): Promise<GameSession | null> => {
      setLoading(true);
      setError(null);
      try {
        return await api.createSession(gameType, players);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Gagal membuat sesi';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createSession, loading, error };
};

export const useSessionState = (sessionId: string) => {
  const [state, setState] = useState<Awaited<ReturnType<typeof api.getSessionState>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getSessionState(sessionId);
      setState(data);
      setError(null);
    } catch {
      setError('Gagal memuat state');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return { state, loading, error, refetch: fetchState };
};
