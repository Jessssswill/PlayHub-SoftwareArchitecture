import axios from 'axios';
import { GameType, GameSession, GameState, TurnResult, Player } from './types';

const http = axios.create({ baseURL: '/api' });

export const getSessions = (status?: string): Promise<GameSession[]> =>
  http.get<GameSession[]>('/sessions', { params: status ? { status } : {} }).then((r) => r.data);

export const getSessionState = (id: string): Promise<GameState> =>
  http.get<GameState>(`/sessions/${id}`).then((r) => r.data);

export const createSession = (gameType: GameType, players: [Player, Player]): Promise<GameSession> =>
  http.post<GameSession>('/sessions', { gameType, players }).then((r) => r.data);

export const joinSession = (id: string, playerId: string, playerName: string) =>
  http.post(`/sessions/${id}/join`, { playerId, playerName }).then((r) => r.data);

export const makeMove = (
  id: string,
  playerId: string,
  move: Record<string, unknown>,
): Promise<TurnResult> =>
  http.post<TurnResult>(`/sessions/${id}/move`, { playerId, move }).then((r) => r.data);

export const endSession = (id: string, requesterId: string) =>
  http.delete(`/sessions/${id}`, { params: { requesterId } }).then((r) => r.data);

export const demoSession = () =>
  http.post('/sessions/demo').then((r) => r.data);
