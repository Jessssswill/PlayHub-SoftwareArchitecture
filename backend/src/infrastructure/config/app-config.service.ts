import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * @pattern Singleton
 * @intent Wrapper type-safe di atas ConfigService NestJS agar caller tidak
 *         perlu tahu nama env variable atau default value-nya.
 *         Diakses via DI — satu instance untuk seluruh aplikasi.
 * @participants ConfigService (wrapped), semua service yang butuh config
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 3001);
  }

  get databasePath(): string {
    return this.config.get<string>('DATABASE', 'game.db');
  }

  /** Apakah synchronize TypeORM aktif — hanya true di development. */
  get dbSynchronize(): boolean {
    return this.config.get<string>('NODE_ENV', 'development') !== 'production';
  }

  get corsOrigin(): string {
    return this.config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  }
}
