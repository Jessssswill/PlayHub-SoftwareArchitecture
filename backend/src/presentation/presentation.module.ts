import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { SessionController } from './controllers/session.controller';
import { GameGateway } from './gateways/game.gateway';

@Module({
  imports: [PersistenceModule],
  controllers: [SessionController],
  providers: [GameGateway],
})
export class PresentationModule {}
