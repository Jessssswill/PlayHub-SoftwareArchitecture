import { GameSession } from '../../business/domain/game-session';

/**
 * @pattern Adapter (Target Interface — Storage)
 * @intent Abstraksi layer persistence agar Business layer tidak tahu apakah
 *         data disimpan di memori (testing) atau SQLite (production).
 *         GameEngineFacade hanya bergantung pada interface ini.
 * @participants InMemoryStorage, TypeOrmStorage (ConcreteAdapter)
 */
export interface ISessionStorage {
  save(session: GameSession): Promise<void>;
  load(id: string): Promise<GameSession | null>;
  delete(id: string): Promise<void>;
  list(): Promise<GameSession[]>;
}

export const SESSION_STORAGE_TOKEN = 'ISessionStorage';
