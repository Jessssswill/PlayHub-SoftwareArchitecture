import { GameSession } from '../../business/domain/game-session';

export interface ISessionStorage {
  save(session: GameSession): Promise<void>;
  load(id: string): Promise<GameSession | null>;
  delete(id: string): Promise<void>;
  list(): Promise<GameSession[]>;
}

export const SESSION_STORAGE_TOKEN = 'ISessionStorage';
