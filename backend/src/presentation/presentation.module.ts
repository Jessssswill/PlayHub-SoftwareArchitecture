import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { SessionController } from './controllers/session.controller';
import { GameGateway } from './gateways/game.gateway';

/**
 * Layer presentasi: HTTP controllers + WebSocket gateways.
 * Mengimpor PersistenceModule untuk mendapatkan proxy, facade, dan registry
 * melalui rantai re-export: PersistenceModule → BusinessModule → InfrastructureModule.
 */
@Module({
  imports: [PersistenceModule],
  controllers: [SessionController],
  providers: [GameGateway],
})
export class PresentationModule {}
