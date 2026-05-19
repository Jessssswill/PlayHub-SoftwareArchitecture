import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GameType } from '../../shared/types/game-type.enum';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Player } from '../../shared/types/player.interface';
import { GameSession } from '../domain/game-session';

/**
 * @pattern Builder
 * @intent Menghindari telescoping constructor pada GameSession yang punya banyak
 *         parameter optional. Builder memastikan objek hanya bisa dibuat dalam
 *         kondisi valid (min 2 player, time control > 0 jika diset).
 * @participants GameSession (Product), GameSessionBuilder (ConcreteBuilder)
 */
@Injectable()
export class GameSessionBuilder {
  private gameType: GameType | null = null;
  private players: Player[] = [];
  private timeControlSeconds = 0;
  private isPrivateFlag = false;
  private allowSpectatorsFlag = false;
  private maxSpectatorsCount = 0;

  /** Reset builder ke kondisi awal, bisa di-reuse untuk session berikutnya. */
  reset(): this {
    this.gameType = null;
    this.players = [];
    this.timeControlSeconds = 0;
    this.isPrivateFlag = false;
    this.allowSpectatorsFlag = false;
    this.maxSpectatorsCount = 0;
    return this;
  }

  forGame(type: GameType): this {
    this.gameType = type;
    return this;
  }

  addPlayer(player: Player): this {
    this.players.push(player);
    return this;
  }

  /** timeControlSeconds harus > 0 jika diset. */
  withTimeControl(seconds: number): this {
    this.timeControlSeconds = seconds;
    return this;
  }

  asPrivate(): this {
    this.isPrivateFlag = true;
    return this;
  }

  withSpectators(max = 0): this {
    this.allowSpectatorsFlag = true;
    this.maxSpectatorsCount = max;
    return this;
  }

  /** Validasi dan bangun GameSession. Throw jika konfigurasi tidak valid. */
  build(): GameSession {
    if (!this.gameType) {
      throw new BadRequestException('Game type harus ditentukan sebelum build().');
    }
    if (this.players.length < 2) {
      throw new BadRequestException(
        `Session butuh minimal 2 player, saat ini hanya ${this.players.length}.`,
      );
    }
    if (this.timeControlSeconds < 0) {
      throw new BadRequestException('Time control tidak boleh negatif.');
    }

    const session = new GameSession({
      id: randomUUID(),
      gameType: this.gameType,
      players: [...this.players],
      status: GameStatus.WAITING,
      currentState: null,
      createdAt: new Date(),
      timeControlSeconds: this.timeControlSeconds,
      isPrivate: this.isPrivateFlag,
      allowSpectators: this.allowSpectatorsFlag,
      maxSpectators: this.maxSpectatorsCount,
    });

    this.reset();
    return session;
  }
}
