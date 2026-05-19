import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from '../business/business.module';
import { GameSessionEntity } from './entities/game-session.entity';
import { GameEngineAuthorizationProxy } from './proxies/authorization.proxy';
import { CachedGameStateProxy } from './proxies/cached-game-state.proxy';
import { InMemoryStorage } from './adapters/in-memory.storage';
import { TypeOrmStorage } from './adapters/typeorm.storage';
import { SESSION_STORAGE_TOKEN } from './adapters/storage.interface';

@Module({
  imports: [
    // BusinessModule sudah re-export InfrastructureModule → GameRegistry tersedia
    BusinessModule,
    TypeOrmModule.forFeature([GameSessionEntity]),
  ],
  providers: [
    GameEngineAuthorizationProxy,
    CachedGameStateProxy,
    InMemoryStorage,
    TypeOrmStorage,
    // Bind token ke TypeOrmStorage untuk production;
    // test bisa override dengan InMemoryStorage
    {
      provide: SESSION_STORAGE_TOKEN,
      useClass: TypeOrmStorage,
    },
  ],
  exports: [
    GameEngineAuthorizationProxy,
    CachedGameStateProxy,
    InMemoryStorage,
    TypeOrmStorage,
    SESSION_STORAGE_TOKEN,
    // Re-export BusinessModule agar AppModule dapat facade & registry
    BusinessModule,
  ],
})
export class PersistenceModule {}
