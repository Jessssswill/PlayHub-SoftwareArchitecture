import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TicTacToeFactory } from './factories/tic-tac-toe.factory';
import { ChessFactory } from './factories/chess.factory';
import { ConnectFourFactory } from './factories/connect-four.factory';
import { GameFactoryProvider } from './factories/game-factory.provider';
import { GameSessionBuilder } from './builders/game-session.builder';
import { TicTacToeGame } from './domain/games/tic-tac-toe/tic-tac-toe.game';
import { ChessGame } from './domain/games/chess/chess.game';
import { ConnectFourGame } from './domain/games/connect-four/connect-four.game';
import { GameEngineFacade } from './facades/game-engine.facade';
import { MoveValidationService } from './services/move-validation.service';
import { GameEventBus } from './events/game-event-bus';

@Module({
  imports: [InfrastructureModule],
  providers: [
    TicTacToeFactory,
    ChessFactory,
    ConnectFourFactory,
    GameFactoryProvider,
    GameSessionBuilder,
    TicTacToeGame,
    ChessGame,
    ConnectFourGame,
    MoveValidationService,
    GameEventBus,
    GameEngineFacade,
  ],
  exports: [
    GameFactoryProvider,
    GameSessionBuilder,
    TicTacToeGame,
    ChessGame,
    ConnectFourGame,
    MoveValidationService,
    GameEventBus,
    GameEngineFacade,
    InfrastructureModule,
  ],
})
export class BusinessModule {}
