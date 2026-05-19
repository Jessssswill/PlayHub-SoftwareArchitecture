import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'game.db',
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
    }),
    // PresentationModule → PersistenceModule → BusinessModule → InfrastructureModule
    PresentationModule,
  ],
})
export class AppModule {}
