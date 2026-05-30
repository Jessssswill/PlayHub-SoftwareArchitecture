import { Injectable, NotFoundException } from '@nestjs/common';
import { GameType } from '../../shared/types/game-type.enum';
import { IGameFactory } from './game-factory.interface';
import { TicTacToeFactory } from './tic-tac-toe.factory';
import { ChessFactory } from './chess.factory';
import { ConnectFourFactory } from './connect-four.factory';

/**
 * @pattern Abstract Factory (Provider / Director)
 * @intent Satu titik akses untuk mendapatkan factory yang tepat berdasarkan GameType,
 *         sehingga caller tidak perlu tahu concrete factory mana yang dipakai.
 * @participants IGameFactory, TicTacToeFactory, ChessFactory, ConnectFourFactory
 */
@Injectable()
export class GameFactoryProvider {
  private readonly factoryMap: Map<GameType, IGameFactory>;

  constructor(
    private readonly ticTacToeFactory: TicTacToeFactory,
    private readonly chessFactory: ChessFactory,
    private readonly connectFourFactory: ConnectFourFactory,
  ) {
    // Map dibangun sekali saat startup — O(1) lookup saat runtime
    this.factoryMap = new Map<GameType, IGameFactory>([
      [GameType.TIC_TAC_TOE, this.ticTacToeFactory],
      [GameType.CHESS, this.chessFactory],
      [GameType.CONNECT_FOUR, this.connectFourFactory],
    ]);
  }

  getFactory(type: GameType): IGameFactory {
    const factory = this.factoryMap.get(type);
    if (!factory) {
      throw new NotFoundException(`No factory registered for game type: ${type}`);
    }
    return factory;
  }
}
