"use client";

import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import { GameSession } from "../lib/types";

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
      setError("Gagal memuat sesi");
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
