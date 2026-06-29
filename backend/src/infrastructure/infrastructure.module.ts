import { Module } from '@nestjs/common';
import { GameRegistry } from './registry/game-registry.service';
import { AppConfigService } from './config/app-config.service';

@Module({
  providers: [GameRegistry, AppConfigService],
  exports: [GameRegistry, AppConfigService],
})
export class InfrastructureModule {}
