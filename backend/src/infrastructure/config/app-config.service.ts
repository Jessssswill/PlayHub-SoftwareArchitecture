import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 3001);
  }

  get databasePath(): string {
    return this.config.get<string>('DATABASE', 'game.db');
  }

  get dbSynchronize(): boolean {
    return this.config.get<string>('NODE_ENV', 'development') !== 'production';
  }

  get corsOrigin(): string {
    return this.config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  }
}
