import { BadRequestException, Injectable } from '@nestjs/common';
import { Game } from '../game.abstract';
import { GameState } from '../game-state';
import { ConnectFourMove, EndCondition } from '../../../../shared/types/move.types';
import { ConnectFourRules } from './connect-four.rules';
import { GameType } from '../../../../shared/types/game-type.enum';

/**
 * @pattern Template Method (ConcreteClass)
 * @intent Implementasi Connect Four menggunakan kerangka Game abstract class.
 */
@Injectable()
export class ConnectFourGame extends Game {
  getType(): GameType {
    return GameType.CONNECT_FOUR;
  }

  protected validateMove(state: GameState, move: ConnectFourMove): void {
    if (move.playerId !== state.currentPlayerId) {
      throw new BadRequestException(`Bukan giliran Anda. Giliran: ${state.currentPlayerId}`);
    }

    if (!ConnectFourRules.isValidColumn(state.boardState, move.col)) {
      throw new BadRequestException('Kolom tidak valid atau sudah penuh.');
    }
  }

  protected applyMove(state: GameState, move: ConnectFourMove): GameState {
    const newState = state.clone();
    const piece = move.playerId === state.playerOrder[0] ? 'R' : 'Y';

    ConnectFourRules.dropPiece(newState.boardState, move.col, piece);

    // Ganti giliran
    const currentIndex = state.playerOrder.indexOf(move.playerId);
    newState.currentPlayerId = state.playerOrder[(currentIndex + 1) % state.playerOrder.length];

    return newState;
  }

  checkEndCondition(state: GameState): EndCondition {
    // Kita harus cek kedua pemain karena kita ingin tahu siapa yang menang
    // Di Connect Four, cuma pemain yang barusan jalan yang bisa menang.
    // Tapi untuk simplicity kita cek keduaya atau simpan lastPlayerId.
    // playerOrder[0] = 'R', playerOrder[1] = 'Y'
    const p1 = state.playerOrder[0];
    const p2 = state.playerOrder[1];

    if (ConnectFourRules.checkWin(state.boardState, 'R')) {
      return { isOver: true, winnerId: p1, isDraw: false };
    }

    if (ConnectFourRules.checkWin(state.boardState, 'Y')) {
      return { isOver: true, winnerId: p2, isDraw: false };
    }

    if (ConnectFourRules.isBoardFull(state.boardState)) {
      return { isOver: true, winnerId: null, isDraw: true };
    }

    return { isOver: false, winnerId: null, isDraw: false };
  }
}
