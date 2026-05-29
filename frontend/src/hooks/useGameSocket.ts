'use client';

import { useEffect } from 'react';
import { subscribeToSession, unsubscribeFromSession, getSocket } from '../lib/socket';
import { useGameStore } from '../lib/store';
import { GameState, GameStatus } from '../lib/types';

interface MoveEvent {
  sessionId: string;
  newState: GameState;
  move: Record<string, unknown>;
  endResult: { isOver: boolean; winnerId: string | null; isDraw: boolean };
}

interface StateEvent {
  sessionId: string;
  from: GameStatus;
  to: GameStatus;
}

interface FinishedEvent {
  sessionId: string;
  endResult: { isOver: boolean; winnerId: string | null; isDraw: boolean };
}

export const useGameSocket = (sessionId: string) => {
  const applyMove = useGameStore((s) => s.applyMove);
  const updateSessionStatus = useGameStore((s) => s.updateSessionStatus);
  const setEndResult = useGameStore((s) => s.setEndResult);

  useEffect(() => {
    const socket = getSocket();

    const connect = () => {
      console.log('Socket connected/reconnected, subscribing to:', sessionId);
      subscribeToSession(sessionId);
    };

    const onMove = (payload: MoveEvent) => {
      if (payload.sessionId !== sessionId) return;
      const playerId = String((payload.move as Record<string, unknown>).playerId ?? '');
      applyMove(payload.newState, {
        playerId,
        description: formatMoveDescription(payload.move),
        timestamp: Date.now(),
      });
      if (payload.endResult.isOver) {
        setEndResult(payload.endResult);
      }
    };

    const onState = (payload: StateEvent) => {
      if (payload.sessionId !== sessionId) return;
      updateSessionStatus(payload.to);
    };

    const onFinished = (payload: FinishedEvent) => {
      if (payload.sessionId !== sessionId) return;
      updateSessionStatus(GameStatus.FINISHED);
      setEndResult(payload.endResult);
    };

    // Initial subscription
    if (socket.connected) {
      connect();
    }

    socket.on('connect', connect);
    socket.on('move', onMove);
    socket.on('state', onState);
    socket.on('finished', onFinished);

    return () => {
      socket.off('connect', connect);
      socket.off('move', onMove);
      socket.off('state', onState);
      socket.off('finished', onFinished);
      unsubscribeFromSession(sessionId);
    };
  }, [sessionId, applyMove, updateSessionStatus, setEndResult]);
};

function formatMoveDescription(move: Record<string, unknown>): string {
  if (move.row !== undefined && move.col !== undefined) {
    return `(${move.row}, ${move.col})`;
  }
  if (move.col !== undefined) {
    return `Column ${Number(move.col) + 1}`;
  }
  if (move.from && move.to) {
    const from = move.from as { row: number; col: number };
    const to = move.to as { row: number; col: number };
    return `${toChessNotation(from)} → ${toChessNotation(to)}`;
  }
  return JSON.stringify(move);
}

function toChessNotation(pos: { row: number; col: number }): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const rank = 8 - pos.row;
  return `${file}${rank}`;
}
