import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // ConfigService tersedia global — tidak perlu import ulang di tiap module
    ConfigModule.forRoot({ isGlobal: true }),

    // SQLite file-based DB; synchronize:true hanya untuk development
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'game.db',
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
