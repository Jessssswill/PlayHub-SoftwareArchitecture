import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISessionStorage } from './storage.interface';
import { GameSession } from '../../business/domain/game-session';
import { GameSessionEntity } from '../entities/game-session.entity';
import { GameType } from '../../shared/types/game-type.enum';
import { GameStatus } from '../../shared/types/game-status.enum';
import { GameState } from '../../business/domain/games/game-state';
import { Player } from '../../shared/types/player.interface';

/**
 * @pattern Adapter (ConcreteAdapter)
 * @intent Adaptasi TypeORM Repository ke interface ISessionStorage,
 *         termasuk serialisasi/deserialisasi GameSession ↔ GameSessionEntity.
 *         Business layer tidak tahu bahwa SQLite dipakai di bawahnya.
 * @participants ISessionStorage (target), TypeORM Repository (adaptee)
 */
@Injectable()
export class TypeOrmStorage implements ISessionStorage {
  constructor(
    @InjectRepository(GameSessionEntity)
    private readonly repo: Repository<GameSessionEntity>,
  ) {}

  async save(session: GameSession): Promise<void> {
    const entity = this.toEntity(session);
    await this.repo.save(entity);
  }

  async load(id: string): Promise<GameSession | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async list(): Promise<GameSession[]> {
    const entities = await this.repo.find();
    return entities.map((e) => this.toDomain(e));
  }

  // ── Mapping helpers ────────────────────────────────────────────────────────

  private toEntity(session: GameSession): GameSessionEntity {
    const entity = new GameSessionEntity();
    entity.id = session.id;
    entity.gameType = session.gameType;
    entity.status = session.status;
    entity.playersJson = JSON.stringify(session.players);
    entity.currentStateJson = session.currentState
      ? JSON.stringify(session.currentState)
      : null;
    entity.createdAt = session.createdAt;
    entity.timeControlSeconds = session.timeControlSeconds;
    entity.isPrivate = session.isPrivate;
    entity.allowSpectators = session.allowSpectators;
    entity.maxSpectators = session.maxSpectators;
    return entity;
  }

  private toDomain(entity: GameSessionEntity): GameSession {
    const players: Player[] = JSON.parse(entity.playersJson);
    const currentState: GameState | null = entity.currentStateJson
      ? Object.assign(new GameState({ boardState: [[]], currentPlayerId: '' }), JSON.parse(entity.currentStateJson))
      : null;

    return new GameSession({
      id: entity.id,
      gameType: entity.gameType as GameType,
      status: entity.status as GameStatus,
      players,
      currentState,
      createdAt: entity.createdAt,
      timeControlSeconds: entity.timeControlSeconds,
      isPrivate: entity.isPrivate,
      allowSpectators: entity.allowSpectators,
      maxSpectators: entity.maxSpectators,
    });
  }
}
